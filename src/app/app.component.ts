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
import { EspnService } from "./services/espn.service";
// import * as moment from "moment";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  user$: Observable<User>;
  leagues: League[];
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private as: AuthService,
    private ls: LeagueService,
    private espn: EspnService,
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
      this.setUpDarkMode();
    });
  }

  getLeagues() {
    this.user$ = this.as.user$;
    this.as.user$.subscribe((user) => {
      if (user) {
        this.ls.getUsersLeagues(user.uid).subscribe((leagues) => {
          this.leagues = leagues;
          // if (leagues) this.updatePicks(leagues);
        });
        this.router.navigate(["home/tabs/leagues"]);
      }
    });
  }

  updatePicks(leagues: League[]) {
    // this.espn.getEvents();
    // .then((events) => {
    // leagues.forEach((l) => {
    //   if (l.picks) {
    //     l.picks
    //       .filter((p) => p.win === undefined)
    //       .forEach((p) => {
    //         const game = events.find((e) => e.id == p.eventId);
    //         if (game.teams[0].winner !== undefined) {
    //           if (game.teams[0].winner) {
    //             p.win = p.teamId === game.teams[0].id;
    //             if (p.win)
    //               l.points += this.pointSystem(
    //                 game.teams[0].rank,
    //                 game.teams[1].rank
    //               );
    //           } else {
    //             p.win = p.teamId === game.teams[1].id;
    //             if (p.win)
    //               l.points += this.pointSystem(
    //                 game.teams[1].rank,
    //                 game.teams[0].rank
    //               );
    //           }
    //         }
    //       });
    //     this.ls.gameUpdate(l);
    //   }
    // });
    // });
  }

  // createNotification(){
  //   const diff = moment().diff(game.date,"days");
  //   if(diff==-1||diff===0)
  //   this.ns.create()
  // }

  pointSystem(firstRank: number, secondRank: number) {
    // first is winner
    if (firstRank <= 15 && secondRank <= 15) return 3;
    else if (firstRank <= 25 && secondRank <= 25) return 2;
    else if (firstRank > 25 && secondRank > 25) return 1;
    else if (firstRank <= 25 && secondRank > 25) return 1;
    else if (firstRank > 25 && secondRank <= 15) return 3;
    else if (firstRank > 25 && secondRank <= 25) return 2;
  }

  dark = false;
  setUpDarkMode() {
    const prefersColor = window.matchMedia("(prefers-color-scheme: dark)");
    this.dark = prefersColor.matches;
    this.toggleDark();
    prefersColor.addEventListener("change", (mediaQuery) => {
      this.dark = mediaQuery.matches;
      this.toggleDark();
    });
  }
  toggleDark() {
    document.body.classList.toggle("dark", this.dark);
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
