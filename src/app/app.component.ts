import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./services/auth.service";
import { Router } from "@angular/router";
import { User } from "./models/user";
import { Observable } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  user: User;
  user$: Observable<User>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private as: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.goHome();
    });
  }
  async goHome() {
    this.user$ = this.as.user$;
    this.user = await this.as.getUser();
    if (this.user) this.router.navigate(["home/tabs/leagues"]);
  }
  logout() {
    return this.as.signOut();
  }
  public selectedIndex = 0;
  public appPages = [
    {
      title: "Create a League",
      url: "/folder/Inbox",
      icon: "add",
    },
    {
      title: "Join a League",
      url: "/folder/Outbox",
      icon: "paper-plane",
    },
  ];
  public labels = [
    "Pierce's Pickems",
    "Other League",
    "League #420",
    "Work",
    "Travel",
    "Reminders",
  ];
}
