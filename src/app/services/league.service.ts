import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { League } from "../models/league";
import { Observable } from "rxjs";
import { User } from "../models/user";

@Injectable({
  providedIn: "root",
})
export class LeagueService {
  private leagueCollection: AngularFirestoreCollection<League>;
  leagues: Observable<League[]>;
  constructor(private readonly afs: AngularFirestore) {
    this.leagueCollection = this.afs.collection<League>("leagues", (ref) =>
      ref.where("isPrivate", "==", false).where("og", "==", true)
    );
    this.leagues = this.leagueCollection.valueChanges();
  }
  getLeagueByName(name: string) {
    return this.afs
      .collection<League>("leagues", (ref) =>
        ref.where("name", "==", name).where("og", "==", true)
      )
      .valueChanges();
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
    await this.leagueCollection.doc(l.id).set(this.sanitize(l));
    return l.id;
  }
  update(l: League) {
    return this.leagueCollection.doc(l.id).update(this.sanitize(l));
  }
  delete(id: string) {
    return this.leagueCollection.doc(id).delete();
  }
  sanitize(l: League) {
    return Object.assign({}, l);
  }
  getUsersLeagues(uid: string) {
    return this.afs
      .collection<League>("leagues", (ref) => ref.where("uid", "==", uid))
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
  join(l: League) {
    l.og = false;
    l.added = Date.now();
    l.rank = l.count + 1;
    this.leagueCollection.doc(l.id).update({ count: l.rank });
    return this.leagueCollection.doc(this.afs.createId()).set(this.sanitize(l));
  }
  savePicks(l: League) {
    return this.leagueCollection.doc(l.id).update({
      picks: l.picks,
    });
  }
}
