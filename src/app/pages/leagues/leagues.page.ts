import { Component } from "@angular/core";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";
import { ModalController } from "@ionic/angular";
import { LeagueModalComponent } from "src/app/modals/league-modal/league-modal.component";
import { User } from "src/app/models/user";

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
  players: League[] = [];
  leagues: League[] = [];
  model = new League();
  constructor(
    private ls: LeagueService,
    private as: AuthService,
    public modalController: ModalController
  ) {
    this.getLeagues();
  }
  getLeagues() {
    this.ls.getUsersLeagues(this.as.getUserId).subscribe((leagues) => {
      console.log("leagues: ", leagues);
      this.leagues = leagues || [];
      this.selectedLeague = this.leagues[0];
      this.firstTime = !this.leagues || this.leagues.length === 0;
      this.getLeagueUsers();
      // const uids = this.leagues.map((l) => l.uid);
      // if (uids && uids.length > 0)
      //   this.ls.getUsers(uids).subscribe((users) => {
      //     users.forEach(
      //       (u) => (u.rank = leagues.find((l) => l.uid == u.uid).rank)
      //     );
      //     this.users = users;
      //   });
      this.loading = false;
    });
  }

  getLeagueUsers() {
    if (this.selectedLeague)
      this.ls
        .getUsersByLeagueId(this.selectedLeague.leagueId)
        .subscribe((users) => (this.players = users));
  }

  async openModal(isCreate: boolean) {
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { isCreate },
    });
    return await modal.present();
  }
}
