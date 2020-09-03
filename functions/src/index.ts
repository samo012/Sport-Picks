import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as moment from "moment";
import fetch from "node-fetch";
// import { League } from '../../src/app/models/league';

admin.initializeApp();
const db = admin.firestore();

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
        return batch.commit();
      }
      return;
    } catch (err) {
      throw new functions.https.HttpsError("internal", err);
    }
  }
);

async function getGames() {
  const today = moment().format("YYYYMMDD");
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?group=80&limit=900&dates=" +
    today;
  const settings = { method: "Get" };
  const res = await fetch(url, settings);
  const obj = await res.json();
  return obj.events as any[];
}

// Runs every hour
export const updateGames = functions
  .runWith({ memory: "2GB" })
  .pubsub.schedule("0 * * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const games = await getGames();
      if (games.length > 0) {
        // Filter by conferences
        const conferences = [1, 4, 8];
        let eventIDs: string[];
        const filtered = games.filter((g) =>
          g.competitions[0].competitors.some(
            (c: { team: { conferenceId: number } }) =>
              conferences.includes(c.team.conferenceId)
          )
        );
        if (filtered.length > 0) {
          eventIDs = filtered.map((g) => g.id);
        } else return;

        const collection = await db
          .collection("leagues")
          .orderBy("picks")
          .get();
        if (collection && collection.docs) {
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
                    const game = filtered.find((e) => e.id == p.eventId);
                    const teams = game.competitions[0].competitors;
                    if (teams[0].winner === false || teams[0].winner === true) {
                      if (teams[0].winner) {
                        p.win = p.teamId === teams[0].id;
                        if (p.win)
                          l.points += pointSystem(
                            teams[0].curatedRank.current,
                            teams[1].curatedRank.current
                          );
                      } else {
                        p.win = p.teamId === teams[1].id;
                        if (p.win)
                          l.points += pointSystem(
                            teams[1].curatedRank.current,
                            teams[0].curatedRank.current
                          );
                      }
                    }
                  }
                );
              batch.update(doc.ref, { picks: l.picks });
            }
          });
          return batch.commit();
        }
      }
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
