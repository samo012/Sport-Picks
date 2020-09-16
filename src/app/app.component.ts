import { Component, NgZone } from "@angular/core";
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
import { Deeplinks } from "@ionic-native/deeplinks/ngx";
// import { EspnService } from "./services/espn.service";
// import * as moment from "moment";
// import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
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
    private router: Router,
    private dl: Deeplinks,
    private zone: NgZone,
    public modalController: ModalController // private espn: EspnService, // private afs: AngularFirestore
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.deepLinks();
      this.goHome();
      this.getLeagues();
      this.setUpDarkMode();
    });
  }

  goHome() {
    this.as.getUser().then(user => {
      if (user) this.router.navigate(["home/tabs/leagues"]);
    });
  }

  deepLinks() {
    this.dl
      .route({
        "/join/:leagueId": "leagues"
      })
      .subscribe(
        match => {
          console.log("match: ", match);
          this.as.getUser().then(user => {
            if (user)
              this.ls.getLeaguesOnce(match.$args.leagueId).then(leagues => {
                if (leagues && leagues.findIndex(f => f.uid == user.uid) < 0) {
                  leagues[0].uid = user.uid;
                  leagues[0].username = user.name;
                  this.ls.join(leagues[0]).then(() => {
                    this.zone.run(() => {
                      this.router.navigateByUrl("/home/tabs/leagues");
                    });
                  });
                }
              });
          });
        },
        err => console.log("err: ", err)
      );
  }

  getLeagues() {
    this.user$ = this.as.user$;
    this.as.user$.subscribe(user => {
      if (user)
        this.ls.getUsersLeagues(user.uid).subscribe(leagues => {
          this.leagues = leagues;
        });
    });
  }

  dark = false;
  setUpDarkMode() {
    const prefersColor = window.matchMedia("(prefers-color-scheme: dark)");
    this.dark = prefersColor.matches;
    this.toggleDark();
    prefersColor.addEventListener("change", mediaQuery => {
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
      componentProps: { state }
    });
    return await modal.present();
  }

  logout() {
    return this.as.signOut();
  }
}

// sports = {
//   NFL: "football/nfl/",
//   NBA: "basketball/nba/",
//   NHL: "hockey/nhl/",
//   MLB: "baseball/mlb/",
//   NCAAF: "football/college-football/",
//   NCAAB: "basketball/mens-college-basketball/",
//   undefined: "football/college-football/",
// } as {
//   [key: string]: string;
// };
//
// async getGames(sport: string) {
//   const today = moment().format("YYYYMMDD");
//   const url =
//     "https://site.api.espn.com/apis/site/v2/sports/" +
//     this.sports[sport] +
//     "/scoreboard?group=80&limit=900&dates=" +
//     today;
//   const settings = { method: "Get" };
//   const res = await fetch(url, settings);
//   const obj = await res.json();
//   return obj.events as any[];
// }
//
// async updatePicks() {
//   const sport = "NFL";
//   const collection = await this.afs
//     .collection("leagues", (ref) => ref.where("sport", "==", sport))
//     .get()
//     .toPromise();
//   if (collection && collection.docs && collection.docs.length > 0) {
//     const games = await this.getGames(sport);
//     console.log("games: ", games);
//     if (games.length > 0) {
//       const eventIDs = games.map((g) => g.id);
//       console.log("eventIDs: ", eventIDs);
//       collection.docs.forEach((doc) => {
//         const l = doc.data();
//         console.log("l: ", l);
//         if (l.picks.length > 0) {
//           const picks = l.picks.filter(
//             (p: { eventId: string; win: boolean; teamId: string }) =>
//               eventIDs.includes(p.eventId) && p.win === undefined
//           );
//           console.log("picks: ", picks);
//           picks.forEach(
//             (p: { eventId: string; win: boolean; teamId: string }) => {
//               const game = games.find((e) => e.id == p.eventId);
//               const teams = game.competitions[0].competitors;
//               teams[0].winner = false;
//               if (teams[0].winner !== undefined) {
//                 if (teams[0].winner) {
//                   p.win = p.teamId == teams[0].id;
//                   if (p.win) {
//                     if (l.type === "spread" || l.sport !== "NCAAF")
//                       l.points += 1;
//                     else
//                       l.points += this.pointSystem(
//                         teams[0].curatedRank.current,
//                         teams[1].curatedRank.current
//                       );
//                   }
//                 } else {
//                   p.win = p.teamId == teams[1].id;
//                   if (p.win) {
//                     if (l.type == "spread" || l.sport !== "NCAAF")
//                       l.points += 1;
//                     else
//                       l.points += this.pointSystem(
//                         teams[1].curatedRank.current,
//                         teams[0].curatedRank.current
//                       );
//                   }
//                 }
//               }
//             }
//           );
//           console.log(" output", l);
//         }
//       });
//     }
//   }
// }
//
// pointSystem(firstRank: number, secondRank: number) {
//   // first is winner
//   if (firstRank <= 15 && secondRank <= 15) return 3;
//   else if (firstRank <= 25 && secondRank <= 25) return 2;
//   else if (firstRank > 25 && secondRank > 25) return 1;
//   else if (firstRank <= 25 && secondRank > 25) return 1;
//   else if (firstRank > 25 && secondRank <= 15) return 3;
//   else if (firstRank > 25 && secondRank <= 25) return 2;
//   else return 0;
// }
