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
      ref.where("isPrivate", "==", false)
    );
    this.leagues = this.leagueCollection.valueChanges();
  }
  getLeagueByName(name: string) {
    return this.afs
      .collection<League>("leagues", (ref) => ref.where("name", "==", name))
      .valueChanges();
  }
  create(l: League) {
    l.id = this.afs.createId();
    l.created = Date.now();
    return this.leagueCollection.doc(l.id).set(this.sanitize(l));
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
        ref.where("leagueId", "==", leagueId)
      )
      .valueChanges();
  }
  join(uid: string, leagueId: string, rank: number) {
    const id = this.afs.createId();
    return this.afs
      .collection<League>("leagues")
      .doc(id)
      .set({ id, uid, leagueId, rank });
  }
}
