import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { Notification } from "../models/notification";
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { Platform } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private nCollection: AngularFirestoreCollection<Notification>;
  constructor(
    private readonly afs: AngularFirestore,
    private functions: AngularFireFunctions,
    private fcm: FCM,
    private router: Router,
    private as: AuthService,
    private platform: Platform
  ) {
    if (this.platform.is("cordova"))
      this.fcm.onNotification().subscribe((data) => {
        console.log(data);
        if (data.wasTapped) {
          console.log("Received in background");
          this.router.navigateByUrl(data.url);
        }
      });
  }

  async getToken() {
    if (this.platform.is("cordova")) {
      const token = await this.fcm.getToken();
      return this.as.updateFCMToken(token);
    } else return Promise.resolve();
  }

  getNotificaitons(uid: string) {
    this.nCollection = this.afs.collection<Notification>(
      "notifications",
      (ref) => ref.where("recipient", "==", uid).orderBy("created", "desc")
    );
    return this.nCollection.valueChanges({ idField: "id" });
  }

  create(n: Notification) {
    n.id = this.afs.createId();
    n.body = n.body || "";
    return this.afs
      .collection("notifications")
      .doc(n.id)
      .set(Object.assign({}, n));
  }
  clear() {
    return this.functions.httpsCallable("clearNotifications")({}).toPromise();
  }
  delete(id: string) {
    return this.nCollection.doc(id).delete();
  }
}
