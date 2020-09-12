import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Notification } from "../models/notification";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private nCollection: AngularFirestoreCollection<Notification>;
  notifications$: Observable<Notification[]>;
  constructor(
    private readonly afs: AngularFirestore,
    private functions: AngularFireFunctions,
    private as: AuthService
  ) {
    this.as.user$.subscribe((user) => {
      if (user) {
        this.nCollection = this.afs.collection<Notification>(
          "notifications",
          (ref) => ref.where("recipient", "==", user.uid).orderBy("created")
        );
        this.notifications$ = this.nCollection.valueChanges();
      }
    });
  }
  create(n: Notification) {
    n.id = this.afs.createId();
    return this.nCollection.doc(n.id).set(Object.assign({}, n));
  }
  clear() {
    return this.functions.httpsCallable("clearNotifications")({}).toPromise();
  }
  delete(id: string) {
    return this.nCollection.doc(id).delete();
  }
}
