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
  getUsersByLeagueId(id: string) {
    return this.afs
      .collection<League>("leagues", (ref) => ref.where("id", "==", id))
      .valueChanges();
  }
  join(l: League) {
    l.og = false;
    return this.afs
      .collection<League>("leagues")
      .doc(l.id)
      .set(this.sanitize(l));
  }
}
