import { ErrorHandler } from "@angular/core";
import { Injectable } from "@angular/core";
import { FirebaseCrashlytics } from "@ionic-native/firebase-crashlytics/ngx";

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private firebaseCrashlytics: FirebaseCrashlytics) {}
  handleError(err: any): void {
    if (
      !err.toString().includes("cordova") &&
      !err.toString().includes("permissions") &&
      !err.toString().includes("plugin") &&
      !err.toString().includes("marker") &&
      !err.toString().includes("overlay")
    ) {
      console.error(err);
      const crashlytics = this.firebaseCrashlytics.initialise();
      crashlytics.logException(err);
    }
  }
}
