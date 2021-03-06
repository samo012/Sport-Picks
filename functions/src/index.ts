import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as moment from "moment";
import fetch from "node-fetch";
// import { League } from "../../src/app/models/league";
// import { Notification } from "../../src/app/models/notification";

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
    if (data.leagueId) {
      const batch = db.batch();
      const snapshot = await db
        .collection("leagues")
        .where("leagueId", "==", data.leagueId)
        .get();
      if (snapshot.docs && snapshot.docs.length > 0) {
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
    if (data.leagueId) {
      const batch = db.batch();
      const snapshot = await db
        .collection("leagues")
        .where("leagueId", "==", data.leagueId)
        .get();
      if (snapshot.docs && snapshot.docs.length > 0) {
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        return { res: "success" };
      }
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
      if (snapshot.docs && snapshot.docs.length > 0) {
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
  const sports = {
    NFL: "football/nfl/",
    NBA: "basketball/nba/",
    NHL: "hockey/nhl/",
    MLB: "baseball/mlb/",
    MLS: "soccer/usa.1/",
    EPL: "soccer/eng.1/",
    NCAAF: "football/college-football/",
    NCAAB: "basketball/mens-college-basketball/",
    NCAABaseball: "baseball/college-baseball/",
    NCAAL: "lacrosse/mens-college-lacrosse/",
  } as {
    [key: string]: string;
  };
  const start = moment().subtract(1, "day").format("YYYYMMDD");
  const end = moment().add(1, "day").format("YYYYMMDD");
  let url =
    "https://site.api.espn.com/apis/site/v2/sports/" +
    sports[sport] +
    "scoreboard?limit=900&dates=" +
    start +
    "-" +
    end;
  if (sport == "NCAAF") url += "&group=80";
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
  .onRun(async () => {
    try {
      const primary = ["NFL", "NCAAF", "NHL"];
      const batch = db.batch();
      await Promise.all(
        primary.map(async (sport) => {
          const collection = await db
            .collection("leagues")
            .where("sport", "==", sport)
            .get();
          if (collection.docs && collection.docs.length > 0) {
            const games = await getGames(sport);
            if (games.length > 0) {
              collection.docs.forEach((doc) => {
                const l = doc.data();
                const pickedGames: string[] = [];
                if (l.picks.length > 0) {
                  l.picks.forEach(
                    (p: { eventId: string; teamId: string; win?: boolean }) => {
                      pickedGames.push(p.eventId);
                      const game = games.find((e) => e.id == p.eventId);
                      if (game && p.win === undefined) {
                        const teams = game.competitions[0].competitors;
                        if (teams[0].winner !== undefined) {
                          const odds = game.competitions[0].odds
                            ? game.competitions[0].odds[0].details
                            : null;
                          if (teams[0].winner) {
                            functions.logger.log("first winner", teams[0].id);
                            p.win = p.teamId == teams[0].id;
                            if (p.win) {
                              if (l.type === "straight") {
                                if (l.sport === "NCAAF")
                                  l.points += cfbPoints(
                                    teams[0].curatedRank.current,
                                    teams[1].curatedRank.current
                                  );
                                else l.points += 1;
                              } else if (odds)
                                l.points += spreadPoints(
                                  teams[0].team.abbreviation,
                                  teams[0].score,
                                  teams[1].score,
                                  odds
                                );
                            }
                          } else {
                            functions.logger.log("first winner", teams[1].id);
                            p.win = p.teamId == teams[1].id;
                            if (p.win) {
                              if (l.type === "straight") {
                                if (l.sport === "NCAAF")
                                  l.points += cfbPoints(
                                    teams[1].curatedRank.current,
                                    teams[0].curatedRank.current
                                  );
                                else l.points += 1;
                              } else if (odds)
                                l.points += spreadPoints(
                                  teams[1].team.abbreviation,
                                  teams[1].score,
                                  teams[0].score,
                                  odds
                                );
                            }
                          }
                        }
                      }
                    }
                  );
                  batch.update(doc.ref, l);
                }
                // Make Notifications for unpicked games today
                if (games.some((g) => !pickedGames.includes(g.id))) {
                  batch.set(db.collection("notifications").doc(), {
                    title: "Unpicked Games",
                    body:
                      "Make your picks for the league, " +
                      l.name +
                      ", before the games lock",
                    recipient: l.uid,
                    created: Date.now(),
                    day: new Date().toLocaleDateString(),
                    leagueId: l.leagueId,
                    token: l.token || "",
                  });
                }
              });
            }
          }
        })
      );
      return batch.commit();
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  });

export const updateSecondary = functions
  .runWith({ memory: "2GB" })
  .pubsub.schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async () => {
    try {
      const batch = db.batch();
      const secondary = ["MLB", "EPL", "MLS"];
      await Promise.all(
        secondary.map(async (sport) => {
          const collection = await db
            .collection("leagues")
            .where("sport", "==", sport)
            .get();
          if (collection.docs && collection.docs.length > 0) {
            const games = await getGames(sport);
            if (games.length > 0) {
              collection.docs.forEach((doc) => {
                const pickedGames: string[] = [];
                const l = doc.data();
                if (l.picks.length > 0) {
                  l.picks.forEach(
                    (p: { eventId: string; teamId: string; win?: boolean }) => {
                      pickedGames.push(p.eventId);
                      const game = games.find((e) => e.id == p.eventId);
                      if (game && p.win === undefined) {
                        const teams = game.competitions[0].competitors;
                        if (teams[0].winner !== undefined) {
                          const odds = game.competitions[0].odds
                            ? game.competitions[0].odds[0].details
                            : null;
                          if (teams[0].winner) {
                            functions.logger.log("sec winner:", teams[0].id);
                            p.win = p.teamId == teams[0].id;
                            if (p.win) {
                              if (l.type === "straight") l.points += 1;
                              else if (odds)
                                l.points += spreadPoints(
                                  teams[0].team.abbreviation,
                                  teams[0].score,
                                  teams[1].score,
                                  odds
                                );
                            }
                          } else {
                            functions.logger.log("sec winner:", teams[1].id);
                            p.win = p.teamId == teams[1].id;
                            if (p.win) {
                              if (l.type === "straight") l.points += 1;
                              else if (odds)
                                l.points += spreadPoints(
                                  teams[1].team.abbreviation,
                                  teams[1].score,
                                  teams[0].score,
                                  odds
                                );
                            }
                          }
                        }
                      }
                    }
                  );
                  batch.update(doc.ref, l);
                }
                // Make Notifications for unpicked games
                if (games.some((g) => !pickedGames.includes(g.id))) {
                  batch.set(db.collection("notifications").doc(), {
                    title: "Unpicked Games",
                    body:
                      "Make your picks for the league, " +
                      l.name +
                      ", before the games lock",
                    recipient: l.uid,
                    created: Date.now(),
                    day: new Date().toLocaleDateString(),
                    leagueId: l.leagueId,
                    token: l.token || "",
                  });
                }
              });
            }
          }
        })
      );
      return batch.commit();
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  });

export const updateTertiary = functions
  .runWith({ memory: "2GB" })
  .pubsub.schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async () => {
    try {
      const batch = db.batch();
      const tertiary = ["NBA", "NCAAB", "NCAABaseball", "NCAAL"];
      await Promise.all(
        tertiary.map(async (sport) => {
          const collection = await db
            .collection("leagues")
            .where("sport", "==", sport)
            .get();
          if (collection.docs && collection.docs.length > 0) {
            const games = await getGames(sport);
            if (games.length > 0) {
              collection.docs.forEach((doc) => {
                const pickedGames: string[] = [];
                const l = doc.data();
                if (l.picks.length > 0) {
                  l.picks.forEach(
                    (p: { eventId: string; teamId: string; win?: boolean }) => {
                      pickedGames.push(p.eventId);
                      const game = games.find((e) => e.id == p.eventId);
                      if (game && p.win === undefined) {
                        const teams = game.competitions[0].competitors;
                        if (teams[0].winner !== undefined) {
                          const odds = game.competitions[0].odds
                            ? game.competitions[0].odds[0].details
                            : null;
                          if (teams[0].winner) {
                            functions.logger.log("ter winner:", teams[0].id);
                            p.win = p.teamId == teams[0].id;
                            if (p.win) {
                              if (l.type === "straight") l.points += 1;
                              else if (odds)
                                l.points += spreadPoints(
                                  teams[0].team.abbreviation,
                                  teams[0].score,
                                  teams[1].score,
                                  odds
                                );
                            }
                          } else {
                            functions.logger.log("ter winner:", teams[1].id);
                            p.win = p.teamId == teams[1].id;
                            if (p.win) {
                              if (l.type === "straight") l.points += 1;
                              else if (odds)
                                l.points += spreadPoints(
                                  teams[1].team.abbreviation,
                                  teams[1].score,
                                  teams[0].score,
                                  odds
                                );
                            }
                          }
                        }
                      }
                    }
                  );
                  batch.update(doc.ref, l);
                }
                // Make Notifications for unpicked games
                if (games.some((g) => !pickedGames.includes(g.id))) {
                  batch.set(db.collection("notifications").doc(), {
                    title: "Unpicked Games",
                    body:
                      "Make your picks for the league, " +
                      l.name +
                      ", before the games lock",
                    recipient: l.uid,
                    created: Date.now(),
                    day: new Date().toLocaleDateString(),
                    leagueId: l.leagueId,
                    token: l.token || "",
                  });
                }
              });
            }
          }
        })
      );
      return batch.commit();
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  });

function cfbPoints(firstRank: number, secondRank: number) {
  // first is winner
  if (firstRank <= 15 && secondRank <= 15) return 3;
  else if (firstRank <= 25 && secondRank <= 25) return 2;
  else if (firstRank > 25 && secondRank > 25) return 1;
  else if (firstRank <= 25 && secondRank > 25) return 1;
  else if (firstRank > 25 && secondRank <= 15) return 3;
  else if (firstRank > 25 && secondRank <= 25) return 2;
  else return 0;
}

function spreadPoints(
  winningTeam: string,
  firstScore: number,
  secondScore: number,
  oddString: string
) {
  const split = oddString.split(" ");
  const abbr = split[0];
  const odd = Number(split[1]);
  const diff = firstScore - secondScore;
  if (winningTeam === abbr && diff > odd) return "";
  return "";
}

// Send Notification to Device
export const deviceNotification = functions.firestore
  .document("notifications/{id}")
  .onCreate(async (change) => {
    const notification = change.data();
    if (
      notification.token &&
      notification.leagueId &&
      notification.recipient &&
      notification.title
    ) {
      const nSnap = await db
        .collection("notifications")
        .where("recipient", "==", notification.recipient)
        .where("leagueId", "==", notification.leagueId)
        .where("day", "==", new Date().toLocaleDateString())
        .get();
      if (nSnap.docs && nSnap.docs.length < 2) {
        const page = notification.title.includes("joined")
          ? "leagues/"
          : "events/";
        const payload = {
          notification: {
            title: notification.title,
            body: notification.body || "",
            icon:
              "https://firebasestorage.googleapis.com/v0/b/pick-ems.appspot.com/o/fcm_icon.png?alt=media&token=cb501b5c-0ba7-4a36-9861-428d32e73c95",
          },
          data: {
            url: "/home/tabs/" + page + notification.leagueId,
          },
        };
        try {
          return admin.messaging().sendToDevice(notification.token, payload);
        } catch (err) {
          throw new functions.https.HttpsError("unknown", err);
        }
      } else return db.doc(change.id).delete();
    }
    return;
  });
