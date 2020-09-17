import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { League } from "../models/league";
import { Observable } from "rxjs";
import { User } from "../models/user";
import { NotificationService } from "./notification.service";
import { Notification } from "../models/notification";
import { AngularFireFunctions } from "@angular/fire/functions";

@Injectable({
  providedIn: "root",
})
export class LeagueService {
  constructor(
    private readonly afs: AngularFirestore,
    private ns: NotificationService,
    private functions: AngularFireFunctions
  ) {}

  getPublicLeagues() {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("permissions", "==", 0).where("og", "==", true)
      )
      .valueChanges();
  }

  getLeagueByName(name: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("name", "==", name).where("og", "==", true)
      )
      .valueChanges();
  }

  getLeagueById(id: string) {
    return this.afs.collection("leagues").doc<League>(id).valueChanges();
  }

  create(l: League) {
    l.creator = l.uid;
    l.og = true;
    l.created = Date.now();
    l.added = Date.now();
    l.id = this.afs.createId();
    l.leagueId =
      l.name.length > 5
        ? l.name.replace(/[^A-Z0-9]/gi, "").slice(0, 5) + l.id.slice(0, 5)
        : l.name.replace(/[^A-Z0-9]/gi, "") + l.id.slice(0, 5);
    return this.afs
      .collection("leagues")
      .doc<League>(l.id)
      .set(this.sanitize(l));
  }

  update(l: League) {
    return this.functions.httpsCallable("editLeague")({ l }).toPromise();
  }

  async updateAdmin(oldID: string, newID: string, uid: string) {
    await this.afs
      .collection("leagues")
      .doc<League>(newID)
      .update({ creator: uid, og: true });
    return this.afs.collection("leagues").doc<League>(oldID).delete();
  }
  updateUsername(id: string, username: string) {
    return this.afs.collection("leagues").doc<League>(id).update({ username });
  }
  delete(id: string) {
    return this.afs.collection("leagues").doc<League>(id).delete();
  }
  deleteLeague(leagueId: string) {
    return this.functions
      .httpsCallable("deleteLeague")({ leagueId })
      .toPromise();
  }
  sanitize(l: League) {
    return Object.assign({}, l);
  }
  getUsersLeagues(uid: string) {
    return this.afs
      .collection<League>("leagues", (ref) => ref.where("uid", "==", uid))
      .valueChanges();
  }
  async getUsersLeaguesOnce(uid: string) {
    const data = await this.afs
      .collection<League>("leagues", (ref) => ref.where("uid", "==", uid))
      .get()
      .toPromise();
    return data.docs.map((d) => d.data() as League);
  }
  async getLeaguesOnce(leagueId: string) {
    const data = await this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("leagueId", "==", leagueId)
      )
      .get()
      .toPromise();
    if (data.docs && data.docs.length > 0)
      return data.docs.map((d) => d.data() as League);
  }
  getOwnersLeagues(uid: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("creator", "==", uid).where("og", "==", true)
      )
      .valueChanges();
  }
  getUsers(uids: string[]) {
    return this.afs
      .collection<User>("users", (ref) => ref.where("uid", "in", uids))
      .valueChanges();
  }
  getUsersByLeagueId(leagueId: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("leagueId", "==", leagueId).orderBy("points", "desc")
      )
      .valueChanges();
  }
  getPicksByLeagueId(leagueId: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("leagueId", "==", leagueId)
      )
      .valueChanges();
  }
  getUsersByLeagueIDs(leagueIDs: string[]) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("leagueId", "in", leagueIDs)
      )
      .valueChanges();
  }
  getPicksByEvent(eventId: string, teamId: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("picks", "array-contains", {
          eventId: eventId,
          teamId: teamId,
        })
      )
      .valueChanges();
  }
  gameUpdate(l: League) {
    l.points;
    return this.savePicks(l);
  }
  join(l: League, userToken: string) {
    l.og = false;
    l.added = Date.now();
    l.id = this.afs.createId();
    l.picks = [];
    l.points = 0;
    const title = l.username + " has joined your league, " + l.name;
    this.ns.create(
      new Notification(title, l.creator, l.token || "", l.leagueId)
    );
    l.token = userToken || "";
    return this.afs
      .collection("leagues")
      .doc<League>(l.id)
      .set(this.sanitize(l));
  }
  savePicks(l: League) {
    return this.afs.collection("leagues").doc<League>(l.id).update({
      picks: l.picks,
    });
  }
}
