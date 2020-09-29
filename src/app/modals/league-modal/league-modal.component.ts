import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { AlertController, IonSelect, ModalController } from "@ionic/angular";
import { League } from "src/app/models/league";
import { LeagueService } from "src/app/services/league.service";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-league-modal",
  templateUrl: "./league-modal.component.html",
  styleUrls: ["./league-modal.component.scss"],
})
export class LeagueModalComponent implements OnDestroy {
  @Input() state: number;
  @Input() leagueId: string;
  league = new League();
  leagues: League[] = [];
  usersLeagues: League[] = [];
  filteredLeagues: League[];
  currUser: User;
  loading = false;
  alreadyJoined = false;
  sport: string;
  username: string;
  sportLeagues = {
    Football: [
      { display: "NFL", value: "NFL" },
      { display: "College Football", value: "NCAAF" },
    ],
    Basketball: [
      { display: "NBA", value: "NBA" },
      { display: "College Basketball", value: "NCAAB" },
    ],
    Soccer: [
      { display: "MLS", value: "MLS" },
      { display: "EPL", value: "EPL" },
    ],
    Baseball: [
      { display: "MLB", value: "MLB" },
      { display: "College Baseball", value: "NCAABaseball" },
    ],
    Hockey: [{ display: "NHL", value: "NHL" }],
    Lacrosse: [{ display: "College Lacrosse", value: "NCAAL" }],
  };
  leagueSports = {
    NFL: "Football",
    NBA: "Basketball",
    NHL: "Hockey",
    MLB: "Baseball",
    MLS: "Soccer",
    EPL: "Soccer",
    NCAAF: "Football",
    NCAAB: "Basketball",
    NCAABaseball: "Baseball",
    NCAAL: "Lacrosse",
  };
  subs = new Subscription();

  constructor(
    private as: AuthService,
    public modalController: ModalController,
    private ls: LeagueService,
    private router: Router,
    public ac: AlertController
  ) {
    this.as.getUser().then((user) => {
      this.currUser = user;
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  ionViewDidEnter() {
    this.loading = false;
    if (this.state === 1) this.setListHeight();
    if (this.state === 2) {
      this.getPublicLeagues();
      this.getUsersLeagues();
    }
    if (this.state === 3) this.getLeague();
  }
  async getUsersLeagues() {
    this.usersLeagues =
      (await this.ls.getUsersLeaguesOnce(this.currUser.uid)) || [];
  }
  getLeague() {
    this.subs.add(
      this.ls.getLeagueById(this.leagueId).subscribe((league) => {
        this.league = league;
        this.sport = this.leagueSports[league.sport];
      })
    );
  }
  getPublicLeagues() {
    this.subs.add(
      this.ls.getPublicLeagues().subscribe((leagues) => {
        if (leagues)
          this.leagues = leagues.filter((l) => l.creator !== this.currUser.uid);
      })
    );
  }
  async submit() {
    this.loading = true;
    const arr = this.ls.usersLeagues.value || [];
    if (this.state === 1) {
      this.league.uid = this.currUser.uid;
      this.league.token = this.currUser.token || "";
      this.league.leagueId = await this.ls.create(this.league);
      arr.unshift(this.league);
    } else {
      console.log("this.league: ", this.league);
      await this.ls.update(this.league);
      const i = arr.findIndex((l) => l.leagueId == this.league.leagueId);
      if (i >= 0) arr[i] = this.league;
    }
    this.ls.usersLeagues.next(arr);
    this.dismissModal();
  }
  async dismissModal() {
    await this.router.navigateByUrl(
      "/home/tabs/leagues/" + (this.league.leagueId || "")
    );
    this.modalController.dismiss(this.league.leagueId);
  }
  selectSport(s: IonSelect) {
    if (this.state === 3) return;
    if (this.sport === "Hockey") this.league.sport = "NHL";
    else if (this.sport === "Lacrosse") this.league.sport = "NCAAL";
    else setTimeout(() => s.open(), 100);
  }
  selectLeague(sl: League) {
    this.league = sl;
    this.alreadyJoined =
      this.usersLeagues.findIndex((l) => l.leagueId == sl.leagueId) >= 0;
  }
  async presentAlert() {
    const alert = await this.ac.create({
      header: "Already Joined",
      message: "You are already a member of this league",
      buttons: ["OK"],
    });
    await alert.present();
  }
  setListHeight() {
    setTimeout(() => {
      const top = document.getElementById("list-header").offsetTop;
      const bottom = document.getElementById("create").offsetTop;
      const list = document.getElementById("small-list");
      if (list) list.style.maxHeight = bottom - top - 50 + "px";
    }, 300);
  }
  searchLeagues(event) {
    this.filteredLeagues =
      this.leagues.filter((l) =>
        l.name.toLowerCase().includes(event.target.value.toLowerCase())
      ) || [];
  }

  async join() {
    if (this.alreadyJoined) return this.presentAlert();
    this.loading = true;
    this.league.username = this.username;
    this.league.uid = this.currUser.uid;
    this.league.token = this.currUser.token || "";
    await this.ls.join(this.league);
    const arr = this.ls.usersLeagues.value || [];
    arr.unshift(this.league);
    this.ls.usersLeagues.next(arr);
    this.dismissModal();
  }
}
