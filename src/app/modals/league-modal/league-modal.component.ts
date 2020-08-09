import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { League } from "src/app/models/league";
import { LeagueService } from "src/app/services/league.service";
import { AuthService } from "src/app/services/auth.service";

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
  constructor(
    private as: AuthService,
    public modalController: ModalController,
    private ls: LeagueService
  ) {}

  ngOnInit() {
    this.getPublicLeagues();
  }
  getPublicLeagues() {
    this.ls.leagues.subscribe((leagues) => (this.leagues = leagues));
  }
  async createLeague() {
    this.model.uid = this.as.getUserId;
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
    this.ls.getUsersByLeagueId(this.selectedLeague.id).subscribe((users) => {
      console.log(users);
      this.selectedLeague.rank = users.length;
      this.selectedLeague.uid = this.as.getUserId;
      this.ls.join(this.selectedLeague).then(() => this.dismissModal());
    });
  }
}
