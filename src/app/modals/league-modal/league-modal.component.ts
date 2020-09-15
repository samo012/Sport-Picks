import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { League } from "src/app/models/league";
import { LeagueService } from "src/app/services/league.service";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";
import { Router } from "@angular/router";

@Component({
  selector: "app-league-modal",
  templateUrl: "./league-modal.component.html",
  styleUrls: ["./league-modal.component.scss"],
})
export class LeagueModalComponent implements OnInit {
  @Input() state: number;
  @Input() leagueId: string;
  model = new League();
  leagues: League[] = [];
  filteredLeagues: League[];
  selectedLeague: League;
  currUser: User;
  isPrivate = false;
  onlyAdmin = true;
  username: string;

  constructor(
    private as: AuthService,
    public modalController: ModalController,
    private ls: LeagueService
  ) {}

  ngOnInit() {
    this.as.getUser().then((user) => {
      this.currUser = user;
      if (this.state === 2) this.getPublicLeagues();
      if (this.state === 3) this.getLeague();
    });
  }
  ionViewDidEnter() {
    if (this.state === 1) this.setListHeight();
  }
  getLeague() {
    this.ls
      .getLeagueById(this.leagueId)
      .subscribe((league) => (this.model = league));
  }
  getPublicLeagues() {
    this.ls.getPublicLeagues().subscribe((leagues) => {
      if (leagues)
        this.leagues = leagues.filter((l) => l.creator !== this.currUser.uid);
    });
  }
  async submit() {
    if (this.state === 1) {
      this.model.uid = this.currUser.uid;
      await this.ls.create(this.model);
    } else await this.ls.update(this.model);

    this.dismissModal();
  }
  dismissModal() {
    this.modalController.dismiss(this.model);
  }

  setListHeight() {
    setTimeout(() => {
      const top = document.getElementById("list-header").offsetTop;
      const bottom = document.getElementById("create").offsetTop;
      const list = document.getElementById("small-list");
      if (list) list.style.maxHeight = bottom - top - 50 + "px";
    }, 500);
  }
  searchLeagues(event) {
    this.filteredLeagues =
      this.leagues.filter((l) =>
        l.name.toLowerCase().includes(event.target.value.toLowerCase())
      ) || [];
  }

  async join() {
    this.selectedLeague.username = this.username;
    this.selectedLeague.uid = this.currUser.uid;
    await this.ls.join(this.selectedLeague);
    this.dismissModal();
  }
}
