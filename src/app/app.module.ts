import { NgModule } from "@angular/core";
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
} from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { Deeplinks } from "@ionic-native/deeplinks/ngx";
import { FCM } from '@ionic-native/fcm/ngx';

import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { environment } from "src/environments/environment";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Facebook } from "@ionic-native/facebook/ngx";
import { SignInWithApple } from "@ionic-native/sign-in-with-apple/ngx";
import { AuthGuard } from "./services/auth.guard";
import { LeagueModalComponent } from "./modals/league-modal/league-modal.component";
import { FormsModule } from "@angular/forms";
import { AngularFireFunctionsModule, ORIGIN } from "@angular/fire/functions";

export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  declarations: [AppComponent, LeagueModalComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule, //  needed for database features
    AngularFireAuthModule, //  needed for auth features
    AngularFireStorageModule, // needed for storage features
    AngularFireFunctionsModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Deeplinks,
    FCM,
    AuthGuard,
    HttpClient,
    GooglePlus,
    Facebook,
    SignInWithApple,
    { provide: ORIGIN, useValue: "https://pick-ems.web.app" },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig },
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
