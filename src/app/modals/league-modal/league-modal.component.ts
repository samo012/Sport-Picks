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
    return this.ls.leagues.subscribe((leagues) => (this.leagues = leagues));
  }
  async createLeague() {
    await this.ls.create(this.model);
    this.dismissModal();
  }
  dismissModal() {
    return this.modalController.dismiss();
  }
  searchLeagues(event) {
    console.log(" this.leagues: ", this.leagues);
    this.filteredLeagues =
      this.leagues.filter((l) =>
        l.name.toLowerCase().includes(event.target.value.toLowerCase())
      ) || [];
    console.log("this.filteredLeagues: ", this.filteredLeagues);
  }
  async join() {
    await this.ls.join(this.as.getUserId, this.selectedLeague.id, 1);
    this.dismissModal();
  }
}
