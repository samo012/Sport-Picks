import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { League } from "src/app/models/league";
import { LeagueService } from "src/app/services/league.service";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";

@Component({
  selector: "app-league-modal",
  templateUrl: "./league-modal.component.html",
  styleUrls: ["./league-modal.component.scss"],
})
export class LeagueModalComponent implements OnInit {
  @Input() isCreate: boolean;
  model = new League();
  leagues: League[] = [];
  filteredLeagues: League[] = [];
  selectedLeague: League;
  currUser: User;

  constructor(
    private as: AuthService,
    public modalController: ModalController,
    private ls: LeagueService
  ) {}

  ngOnInit() {
    this.as.getUser().then((user) => {
      this.currUser = user;
      this.getPublicLeagues();
    });
  }
  getPublicLeagues() {
    this.ls.leagues.subscribe((leagues) => {
      if (leagues)
        this.leagues = leagues.filter((l) => l.creator !== this.currUser.uid);
    });
  }
  async createLeague() {
    this.model.username = this.currUser.name;
    this.model.uid = this.currUser.uid;
    await this.ls.create(this.model);
    this.dismissModal();
  }
  dismissModal() {
    return this.modalController.dismiss();
  }

  searchLeagues(event) {
    this.filteredLeagues =
      this.leagues.filter((l) =>
        l.name.toLowerCase().includes(event.target.value.toLowerCase())
      ) || [];
  }

  async join() {
    this.selectedLeague.uid = this.currUser.uid;
    this.selectedLeague.username = this.currUser.name;
    this.ls.join(this.selectedLeague).then(() => this.dismissModal());
  }
}
