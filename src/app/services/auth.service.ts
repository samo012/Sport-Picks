import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { first, switchMap, take } from "rxjs/operators";
import * as firebase from "firebase";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { User } from "src/app/models/user";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Facebook } from "@ionic-native/facebook/ngx";
import { Platform } from "@ionic/angular";
import {
  SignInWithApple,
  ASAuthorizationAppleIDRequest,
  AppleSignInErrorResponse,
} from "@ionic-native/sign-in-with-apple/ngx";
import { AngularFireStorage } from "@angular/fire/storage";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: firebase.User;
  user$: Observable<User>;
  constructor(
    public afAuth: AngularFireAuth,
    public afstore: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router,
    private gplus: GooglePlus,
    private facebook: Facebook,
    private apple: SignInWithApple,
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
  isThirdParty() {
    return (
      this.user.providerData[0] &&
      this.user.providerData[0].providerId != "password"
    );
  }
  get getUserId() {
    if (!this.user) this.afAuth.currentUser.then((user) => (this.user = user));
    if (this.user) return this.user.uid;
    // else localStorage.getItem("uid")
  }

  async signInRegular(user) {
    const res = await this.afAuth.signInWithEmailAndPassword(
      user.email,
      user.password
    );
    this.user = res.user;
    return this.getUserDetails(res.user.uid);
  }

  async updatePassword(oldPassword: string, newPassword: string) {
    const cred = firebase.auth.EmailAuthProvider.credential(
      this.user.email,
      oldPassword
    );
    await this.user.reauthenticateWithCredential(cred);
    await this.user.updatePassword(newPassword);
  }

  async deleteUser() {
    await this.afstore.doc(this.user.uid).delete();
    return this.user.delete();
  }

  async uploadImg(file: any, path: string): Promise<string> {
    if (!file || !path) return;
    if (Array.isArray(file)) file = file[0];
    var imagesRef = this.storage.ref(path);
    await imagesRef.putString(file, "data_url");
    return imagesRef.getDownloadURL().toPromise();
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
      } else return this.webSignIn(true);
    } catch (e) {
      alert(e);
    }
  }

  async signInWithApple() {
    const appleRes = await this.apple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail,
      ],
    });
    if (!appleRes) return null;
    var provider = new firebase.auth.OAuthProvider("apple.com");
    const res = await this.afAuth.signInWithCredential(
      provider.credential({
        idToken: appleRes.identityToken,
        // rawNonce: unhashedNonce,
      })
    );
    if (!res) return null;
    this.user = res.user;
    const user = new User();
    user.name =
      appleRes.fullName.givenName + " " + appleRes.fullName.familyName;
    user.email = appleRes.email;
    return user;
  }

  signOut() {
    this.router.navigateByUrl("/", { replaceUrl: true }).then(() =>
      this.afAuth
        .signOut()
        .then(() => {
          if (this.user.providerData[0])
            this.user.providerData[0].providerId == "google.com"
              ? this.gplus.disconnect()
              : this.facebook.logout();
        })
        .finally(() => window.location.reload())
    );
  }

  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  addUser(user) {
    return this.afstore
      .doc(`users/${this.user.uid}`)
      .set(Object.assign({}, user));
  }

  async registerUser(user: User, socialRegister: boolean) {
    user.name = user.first + " " + user.last;
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
      localStorage.setItem("email", user.email);
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
  updateYelpId(yelpId: string) {
    return this.afstore
      .collection("users")
      .doc(this.getUserId)
      .update({ yelpId: yelpId });
  }
  updateFCMToken(token: string) {
    return this.afstore
      .collection("users")
      .doc(this.getUserId)
      .update({ token: token });
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
