import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as moment from "moment";
import fetch from "node-fetch";
// import { League } from '../../src/app/models/league';

admin.initializeApp();
const db = admin.firestore();

export const editLeague = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  try {
    const batch = db.batch();
    const snapshot = await db
      .collection("leagues")
      .where("leagueId", "==", data.leagueId)
      .get();
    if (snapshot && snapshot.docs) {
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          name: data.name,
          permissions: data.permissions,
          type: data.type,
        });
      });
      await batch.commit();
      return { res: "success" };
    }
    return { res: "no change" };
  } catch (err) {
    throw new functions.https.HttpsError("internal", err);
  }
});

export const deleteLeague = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  try {
    const batch = db.batch();
    const snapshot = await db
      .collection("leagues")
      .where("leagueId", "==", data.leagueId)
      .get();
    if (snapshot && snapshot.docs) {
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      return { res: "success" };
    }
    return { res: "no change" };
  } catch (err) {
    throw new functions.https.HttpsError("internal", err);
  }
});

export const clearNotifications = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }
    try {
      const uid = context.auth.uid;
      const batch = db.batch();
      const snapshot = await db
        .collection("notifications")
        .where("recipient", "==", uid)
        .get();
      if (snapshot && snapshot.docs) {
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        return { res: "success" };
      }
      return { res: "no change" };
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  }
);

async function getGames(sport: string) {
  const today = moment().format("YYYYMMDD");
  const sports = {
    NFL: "football/nfl/",
    NBA: "basketball/nba/",
    NHL: "hockey/nhl/",
    MLB: "baseball/mlb/",
    NCAAF: "football/college-football/",
    NCAAB: "basketball/mens-college-basketball/",
    undefined: "football/college-football/",
  } as {
    [key: string]: string;
  };
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/" +
    sports[sport] +
    "/scoreboard?group=80&limit=900&dates=" +
    today;
  const settings = { method: "Get" };
  const res = await fetch(url, settings);
  const obj = await res.json();
  return obj.events as any[];
}

// Filter by conferences
// const conferences = [1, 4, 8];
// let eventIDs: string[];
// const filtered = games.filter((g) =>
//   g.competitions[0].competitors.some(
//     (c: { team: { conferenceId: number } }) =>
//       conferences.includes(c.team.conferenceId)
//   )
// );
// if (filtered.length > 0) {
//   eventIDs = filtered.map((g) => g.id);
// } else return;

// Runs every hour
export const updatePrimary = functions
  .runWith({ memory: "2GB" })
  .pubsub.schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const primary = ["NFL", "NCAAF", "NBA"];
      primary.forEach(async (sport) => {
        const collection = await db
          .collection("leagues")
          .where("sport", "==", sport)
          .get();
        if (collection && collection.docs && collection.docs.length > 0) {
          const games = await getGames(sport);
          if (games.length > 0) {
            const eventIDs = games.map((g) => g.id);
            const batch = db.batch();
            collection.docs.forEach((doc) => {
              const l = doc.data();
              if (l.picks.length > 0) {
                l.picks
                  .filter(
                    (p: { eventId: string; win: boolean; teamId: string }) =>
                      eventIDs.includes(p.eventId) && p.win === undefined
                  )
                  .forEach(
                    (p: { eventId: string; win: boolean; teamId: string }) => {
                      const game = games.find((e) => e.id == p.eventId);
                      const teams = game.competitions[0].competitors;
                      functions.logger.log("teams:", teams);
                      if (teams[0].winner !== undefined) {
                        if (teams[0].winner) {
                          p.win = p.teamId == teams[0].id;
                          if (p.win) {
                            if (l.type === "spread" || l.sport !== "NCAAF")
                              l.points += 1;
                            else
                              l.points += pointSystem(
                                teams[0].curatedRank.current,
                                teams[1].curatedRank.current
                              );
                          }
                        } else {
                          p.win = p.teamId == teams[1].id;
                          if (p.win) {
                            if (l.type == "spread" || l.sport !== "NCAAF")
                              l.points += 1;
                            else
                              l.points += pointSystem(
                                teams[1].curatedRank.current,
                                teams[0].curatedRank.current
                              );
                          }
                        }
                      }
                    }
                  );
                batch.update(doc.ref, l);
              }
            });
            return batch.commit();
          }
        }
        return;
      });
      return;
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  });

export const updateSecondary = functions
  .runWith({ memory: "2GB" })
  .pubsub.schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const secondary = ["NHL", "MLB", "NCAAB"];
      secondary.forEach(async (sport) => {
        const collection = await db
          .collection("leagues")
          .where("sport", "==", sport)
          .get();
        if (collection && collection.docs && collection.docs.length > 0) {
          const games = await getGames(sport);
          if (games.length > 0) {
            const eventIDs = games.map((g) => g.id);
            const batch = db.batch();
            collection.docs.forEach((doc) => {
              const l = doc.data();
              if (l.picks.length > 0) {
                l.picks
                  .filter(
                    (p: { eventId: string; win: boolean; teamId: string }) =>
                      eventIDs.includes(p.eventId) && p.win === undefined
                  )
                  .forEach(
                    (p: { eventId: string; win: boolean; teamId: string }) => {
                      const game = games.find((e) => e.id == p.eventId);
                      const teams = game.competitions[0].competitors;
                      functions.logger.log("sec-teams:", teams);
                      if (teams[0].winner !== undefined) {
                        if (teams[0].winner) {
                          p.win = p.teamId == teams[0].id;
                          if (p.win) l.points += 1;
                        } else {
                          p.win = p.teamId == teams[1].id;
                          if (p.win) l.points += 1;
                        }
                      }
                    }
                  );
                batch.update(doc.ref, l);
              }
            });
            return batch.commit();
          }
        }
        return;
      });
      return;
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  });

function pointSystem(firstRank: number, secondRank: number) {
  // first is winner
  if (firstRank <= 15 && secondRank <= 15) return 3;
  else if (firstRank <= 25 && secondRank <= 25) return 2;
  else if (firstRank > 25 && secondRank > 25) return 1;
  else if (firstRank <= 25 && secondRank > 25) return 1;
  else if (firstRank > 25 && secondRank <= 15) return 3;
  else if (firstRank > 25 && secondRank <= 25) return 2;
  else return 0;
}
