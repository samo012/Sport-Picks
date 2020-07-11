import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { first, switchMap } from "rxjs/operators";
import * as firebase from "firebase/app";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Facebook } from "@ionic-native/facebook/ngx";
import { Platform } from "@ionic/angular";
import { User } from '../models/user';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: firebase.User;
  user$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    public afstore: AngularFirestore,
    private router: Router,
    private gplus: GooglePlus,
    private facebook: Facebook,
    private platform: Platform
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          this.user = user;
          return this.afstore.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }
  getUser() {
    return this.user$.pipe(first()).toPromise();
  }
  get getUserId() {
    return localStorage.getItem("uid");
  }

  async signInRegular(user) {
    const res = await this.afAuth.signInWithEmailAndPassword(
      user.email,
      user.password
    );
    this.user = res.user;
    return this.getUserDetails(res.user.uid);
  }

  async signInWithGoogle() {
    try {
      if (this.platform.is("cordova")) {
        const gplusUser = await this.gplus.login({
          webClientId:
            "20229215758-kol6nk1v9hu1q0l79tkfn77v3l4uhlu6.apps.googleusercontent.com",
          offline: true,
          scopes: "profile email",
        });

        const res = await this.afAuth.signInWithCredential(
          firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken)
        );
        this.user = res.user;
        return res.user;
      } else this.webSignIn(true);
    } catch (e) {
      alert(e);
    }
  }

  signOut() {
    this.afAuth
      .signOut()
      .then(() => {
        if (this.user.providerData[0])
          this.user.providerData[0].providerId == "google.com"
            ? this.gplus.disconnect()
            : this.facebook.logout();
      })
      .finally(() => this.router.navigateByUrl("/", { replaceUrl: true }));
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  // canRead(user: User): boolean {
  //   const allowed = ["admin", "model", "moderator"];
  //   return this.checkAuthorization(user, allowed);
  // }

  // canEdit(user: User): boolean {
  //   const allowed = ["admin", "moderator"];
  //   return this.checkAuthorization(user, allowed);
  // }

  // canDelete(user: User): boolean {
  //   const allowed = ["admin"];
  //   return this.checkAuthorization(user, allowed);
  // }

  // determines if user has matching role
  // private checkAuthorization(user: User, allowedRoles: string[]): boolean {
  //   if (!user) return false;
  //   for (const role of allowedRoles) {
  //     if (user.roles[role]) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  addUser(user) {
    return this.afstore
      .doc(`users/${this.user.uid}`)
      .set(Object.assign({}, user));
  }

  async registerUser(user: User, socialRegister: boolean) {
    localStorage.setItem("email", user.email);
    if (socialRegister && this.user && this.user.uid) {
      //social sign up
      delete user.password;
      user.uid = this.user.uid;
      this.afstore.doc(`users/${this.user.uid}`).set(Object.assign({}, user));
      return this.user.uid;
    } else {
      //regular sign up
      const res = await this.afAuth.createUserWithEmailAndPassword(
        user.email,
        user.password
      );
      const userId = res.user.uid;
      user.uid = userId;
      delete user.password;
      this.afstore.doc(`users/${userId}`).set(Object.assign({}, user));
      return userId;
    }
  }

  async isAuthenticated() {
    if (this.user) return true;
    const user = await this.afAuth.authState.pipe(first()).toPromise();
    if (user) {
      this.user = user;
      return true;
    }
    return false;
  }

  async getUserDetails(userId: string) {
    const doc = await this.afstore.doc(`users/${userId}`).get().toPromise();
    if (doc.exists) {
      const data = doc.data() as User;
      data.uid = doc.id;
      return data;
    } else return undefined;
  }
  async getUserById(userId: string) {
    const doc = await this.afstore.doc(`users/${userId}`).get().toPromise();
    return doc.exists ? (doc.data() as User) : undefined;
  }
  updateUser(user: User) {
    return this.afstore
      .collection("users")
      .doc(this.user.uid)
      .update(Object.assign({}, user));
  }
  

  async webSignIn(isGoogle: boolean) {
    let provider = isGoogle
      ? new firebase.auth.GoogleAuthProvider()
      : new firebase.auth.FacebookAuthProvider();
    const result = await this.afAuth.signInWithPopup(provider);
    this.user = result.user;
    return result.user;
  }

  async signinWithCredential(credential: firebase.auth.OAuthCredential) {
    const res = await this.afAuth.signInWithCredential(credential);
    this.user = res.user;
    return res.user.uid;
  }
  async signInWithFacebook() {
    if (this.platform.is("cordova")) {
      const response = await this.facebook.login(["public_profile", "email"]);

      console.log(response);

      if (response.authResponse) {
        // User is signed-in Facebook.

        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(response.authResponse, this.user)) {
          // Build Firebase credential with the Facebook auth token.
          const credential = firebase.auth.FacebookAuthProvider.credential(
            response.authResponse.accessToken
          );
          // Sign in with the credential from the Facebook user.
          const res = await firebase.auth().signInWithCredential(credential);
          this.user = res.user;
          return res.user;
        } else {
          // User is already signed-in Firebase with the correct user.
          console.log("already signed in");
        }
      } else {
        // User is signed-out of Facebook.
        firebase.auth().signOut();
      }
    } else this.webSignIn(false);
  }
  isUserEqual(facebookAuthResponse, firebaseUser): boolean {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;

      providerData.forEach((data) => {
        if (
          data.providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
          data.uid === facebookAuthResponse.userID
        ) {
          // We don't need to re-auth the Firebase connection.
          return true;
        }
      });
    }

    return false;
  }

}