import { Component, TemplateRef, ElementRef } from "@angular/core";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";
import { ModalController, PopoverController } from "@ionic/angular";
import { LeagueModalComponent } from "src/app/modals/league-modal/league-modal.component";
import { User } from "src/app/models/user";
import { EllipsisPopover } from "src/app/modals/ellipsis-popover/ellipsis-popover.component";

@Component({
  selector: "app-leagues",
  templateUrl: "leagues.page.html",
  styleUrls: ["leagues.page.scss"],
})
export class LeaguesPage {
  selectedLeague: League;
  subtitle: string;
  firstTime = true;
  loading = true;
  players: League[] = [];
  leagues: League[] = [];
  model = new League();
  uid = this.as.getUserId;

  constructor(
    private ls: LeagueService,
    private as: AuthService,
    public modalController: ModalController,
    public popoverController: PopoverController
  ) {
    this.getLeagues();
  }

  getLeagues() {
    this.ls.getUsersLeagues(this.uid).subscribe((leagues) => {
      console.log("leagues: ", leagues);
      this.leagues = leagues || [];
      this.selectedLeague = this.leagues[0];
      this.firstTime = !this.leagues || this.leagues.length === 0;
      this.getLeagueUsers();
      this.loading = false;
    });
  }

  getSubtitle() {
    const second =
      this.selectedLeague.type === "spread"
        ? " - Spread - "
        : " - Straight Up - ";
    const third =
      this.selectedLeague.permissions === 2
        ? "Admin Invite Only"
        : this.selectedLeague.permissions === 1
        ? "Invite Only"
        : "Public";
    this.subtitle = this.selectedLeague.sport || "NCAAF" + second + third;
  }

  getLeagueUsers() {
    if (this.selectedLeague) {
      this.getSubtitle();
      this.ls
        .getUsersByLeagueId(this.selectedLeague.leagueId)
        .subscribe((users) => {
          var rank = 1;
          if (users) {
            for (let index = 0; index < users.length; index++) {
              const user = users[index];
              if (index === 0) user.rank = 1;
              else if (user.points !== users[index - 1].points) {
                rank = rank + 1;
                user.rank = rank;
              } else user.rank = rank;
            }
            this.players = users;
          } else this.players = [];
        });
    }
  }
  share() {
    console.log("share: ");
  }
  delete() {
    this.ls.deleteLeague(this.selectedLeague.leagueId);
  }
  async openModal(state: number) {
    const leagueId = this.selectedLeague ? this.selectedLeague.id : null;
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { state, leagueId },
    });
    modal.onDidDismiss().then((props) => {
      console.log("props: ", props);
      this.selectedLeague = props.data;
    });
    return await modal.present();
  }
  async openPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: EllipsisPopover,
      event: ev,
      translucent: true,
      componentProps: {
        sl: this.selectedLeague,
        isAdmin: this.selectedLeague.creator === this.uid,
      },
    });
    popover.onWillDismiss().then((props) => {
      if (props.data == "share") this.share();
      else if (props.data == "edit") this.openModal(3);
      else if (props.data == "delete") this.delete();
    });
    return await popover.present();
  }
}
