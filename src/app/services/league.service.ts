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

@Injectable({
  providedIn: "root",
})
export class LeagueService {
  constructor(
    private readonly afs: AngularFirestore,
    private ns: NotificationService
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

  async create(l: League) {
    l.creator = l.uid;
    l.og = true;
    l.created = Date.now();
    l.added = Date.now();
    l.rank = 1;
    l.id = this.afs.createId();
    l.leagueId =
      l.name.length > 5
        ? l.name.replace(/[^A-Z0-9]/gi, "").slice(0, 5) + l.id.slice(0, 5)
        : l.name.replace(/[^A-Z0-9]/gi, "") + l.id.slice(0, 5);
    await this.afs
      .collection("leagues")
      .doc<League>(l.id)
      .set(this.sanitize(l));
    return l.id;
  }

  update(l: League) {
    return this.afs
      .collection("leagues")
      .doc<League>(l.id)
      .update(this.sanitize(l));
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
  sanitize(l: League) {
    return Object.assign({}, l);
  }
  getUsersLeagues(uid: string) {
    return this.afs
      .collection<League>("leagues", (ref) => ref.where("uid", "==", uid))
      .valueChanges();
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
        ref.where("leagueId", "==", leagueId).orderBy("rank")
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
  join(l: League) {
    l.og = false;
    l.added = Date.now();
    l.id = this.afs.createId();
    const title = l.username + " has joined your league, " + l.name;
    this.ns.create(new Notification(title, l.creator));
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
