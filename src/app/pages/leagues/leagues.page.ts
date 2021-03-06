import { Component } from "@angular/core";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";
import { ModalController, PopoverController } from "@ionic/angular";
import { LeagueModalComponent } from "src/app/modals/league-modal/league-modal.component";
import { User } from "src/app/models/user";
import { EllipsisPopover } from "src/app/modals/ellipsis-popover/ellipsis-popover.component";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-leagues",
  templateUrl: "leagues.page.html",
  styleUrls: ["leagues.page.scss"],
})
export class LeaguesPage {
  selectedLeague: League;
  noLeagues: boolean;
  loading = true;
  players: League[] = [];
  leagues: League[] = [];
  model = new League();
  user: User;

  constructor(
    private ls: LeagueService,
    private as: AuthService,
    private socialSharing: SocialSharing,
    public modalController: ModalController,
    public popoverController: PopoverController,
    private route: ActivatedRoute
  ) {
    this.as.getUser().then((user) => {
      this.user = user;
      this.getLeagues();
      this.checkInvites();
    });
  }

  getLeagues() {
    this.ls.getUsersLeagues(this.user.uid).subscribe((leagues) => {
      this.leagues = leagues || [];
      const id = this.route.snapshot.params.id;
      this.selectedLeague = id
        ? this.leagues.find((l) => l.leagueId == id)
        : this.leagues[0];
      this.noLeagues = !this.leagues || this.leagues.length === 0;
      if (this.noLeagues) this.loading = false;
      else this.getLeagueUsers();
    });
  }

  async checkInvites() {
    const leagueId = localStorage.getItem("leagueId");
    if (leagueId) {
      const ls = await this.ls.getLeaguesOnce(leagueId);
      if (ls) this.join(ls[0]);
    }
  }

  getLeagueUsers() {
    if (this.selectedLeague) {
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
          this.loading = false;
        });
    } else this.loading = false;
  }

  share() {
    const msg =
      this.user.name +
      " would like you to join their league, " +
      this.selectedLeague.name;
    const subject = "Join My Pick'ems League";
    const link =
      "https://pick-ems.web.app/join/" + this.selectedLeague.leagueId;
    return this.socialSharing.share(msg, subject, null, link);
  }

  async delete() {
    this.loading = true;
    this.route.snapshot.params = {};
    const arr = this.ls.usersLeagues.value || [];
    const i = arr.findIndex((a) => a.leagueId === this.selectedLeague.leagueId);
    arr.splice(i, 1);
    this.ls.usersLeagues.next(arr);
    await this.ls.deleteLeague(this.selectedLeague.leagueId);
    this.loading = false;
  }

  async leave() {
    this.loading = true;
    this.route.snapshot.params = {};
    await this.ls.delete(this.selectedLeague.id);
    this.loading = false;
  }

  async join(l: League) {
    l.uid = this.user.uid;
    l.username = this.user.name;
    l.token = this.user.token;
    await this.ls.join(l);
    localStorage.removeItem("leagueId");
  }

  async openModal(state: number) {
    const leagueId = this.selectedLeague ? this.selectedLeague.id : null;
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { state, leagueId },
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
        isAdmin: this.selectedLeague.creator === this.user.uid,
      },
    });
    popover.onWillDismiss().then((props) => {
      if (props.data == "share") this.share();
      else if (props.data == "edit") this.openModal(3);
      else if (props.data == "delete") this.delete();
      else if (props.data == "leave") this.leave();
    });
    return await popover.present();
  }
}
