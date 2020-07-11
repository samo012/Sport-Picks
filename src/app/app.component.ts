import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
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
