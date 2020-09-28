import { Injectable, ErrorHandler } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class MyErrorHandler implements ErrorHandler {
  constructor(private afs: AngularFirestore, private as: AuthService) {}
  handleError(error: any): void {
    console.error(error);
    let text = error;
    let location = "unknown";
    if (error instanceof Error) {
      text =
        <any>error.message instanceof Error
          ? (error.message as any).message
          : error.message;
      location = error.stack;
    }
    this.afs.collection("errors").add({
      text: text,
      location: location,
      uid: this.as.getUserId || "",
      created: Date.now()
    });
  }
}
