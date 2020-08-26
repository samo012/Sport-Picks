import { Component } from "@angular/core";
import { Platform, ModalController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./services/auth.service";
import { Router } from "@angular/router";
import { User } from "./models/user";
import { Observable } from "rxjs";
import { LeagueModalComponent } from "./modals/league-modal/league-modal.component";
import { LeagueService } from "./services/league.service";
import { League } from "./models/league";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  user$: Observable<User>;
  leagues$: Observable<League[]>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private as: AuthService,
    private ls: LeagueService,
    private router: Router,
    public modalController: ModalController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.getLeagues();
    });
  }
  getLeagues() {
    this.user$ = this.as.user$;
    this.as.user$.subscribe((user) => {
      if (user) {
        this.leagues$ = this.ls.getUsersLeagues(user.uid);
        this.router.navigate(["home/tabs/leagues"]);
      }
    });
  }
  async openModal(state: number) {
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { state },
    });
    return await modal.present();
  }

  logout() {
    return this.as.signOut();
  }

  public labels = [
    "Pierce's Pickems",
    "Other League",
    "League #420",
    "Work",
    "Travel",
    "Reminders",
  ];
}
