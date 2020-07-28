import { Component } from "@angular/core";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";
import { ModalController } from "@ionic/angular";
import { LeagueModalComponent } from "src/app/modals/league-modal/league-modal.component";

@Component({
  selector: "app-leagues",
  templateUrl: "leagues.page.html",
  styleUrls: ["leagues.page.scss"],
})
export class LeaguesPage {
  // leagues:League[] = [
  //   {
  //     name: "First League",
  //     users: [
  //       { rank: 1, name: "Andrew Samole" },
  //       { rank: 2, name: "Pierce Bailey" },
  //       { rank: 3, name: "Peter Rood" },
  //       { rank: 4, name: "Jen Butler" },
  //       { rank: 5, name: "Brooker Bailey" },
  //       { rank: 6, name: "Linda Bailey" },
  //       { rank: 7, name: "Adam Samole" },
  //       { rank: 8, name: "Robert Bailey" },
  //     ],
  //   },
  //   {
  //     name: "Second League",
  //     users: [
  //       { rank: 1, name: "Joe Mama" },
  //       { rank: 2, name: "Moe Lester" },
  //       { rank: 3, name: "Ben Dover" },
  //       { rank: 4, name: "Mike Hawk" },
  //     ],
  //   },
  //   {
  //     name: "Third League",
  //     users: [
  //       { rank: 1, name: "Andrew Samole" },
  //       { rank: 2, name: "Pierce Bailey" },
  //       { rank: 3, name: "Peter Rood" },
  //       { rank: 4, name: "Jen Butler" },
  //     ],
  //   },
  // ];
  selectedLeague: League;
  firstTime = true;
  loading = true;
  leagues: League[] = [];
  model = new League();
  constructor(
    private ls: LeagueService,
    private as: AuthService,
    public modalController: ModalController
  ) {
    this.getLeagues();
  }
  users;
  getLeagues() {
    this.ls.getUsersLeagues(this.as.getUserId).subscribe((leagues) => {
      this.leagues = leagues;
      this.selectedLeague = this.leagues[0];
      this.firstTime = !this.leagues || this.leagues.length === 0;
      this.ls
        .getUsers(this.leagues.map((l) => l.uid))
        .subscribe((users) => (this.users = users));
    });
  }
  async openModal(isCreate: boolean) {
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { isCreate },
    });
    return await modal.present();
  }
  async joinLeague(l) {
    const user = await this.as.getUser();
    return this.ls.update(l);
  }
}
