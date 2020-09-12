import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "src/app/models/user";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { ToastController } from "@ionic/angular";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
  oldPassword: string;
  newPassword: string;
  confirm: string;
  index = 0;
  deleteReady = false;
  err = false;
  leagues: League[];
  newAdmins = new Map<string, string>();
  oldIDs = new Map<string, string>();
  leagueUsers = new Map<string, League[]>();
  changePass: boolean;
  loading = false;

  constructor(
    private as: AuthService,
    private ls: LeagueService,
    private route: ActivatedRoute,
    private router: Router,
    public toastController: ToastController
  ) {
    this.changePass = this.route.snapshot.queryParamMap.get("type") == "change";
    if (!this.changePass) this.getLeagueUsers();
  }

  ngOnInit() {}
  async presentToast() {
    const toast = await this.toastController.create({
      message: "Password Successfully Updated",
      duration: 2000,
    });
    toast.present();
  }
  selectAdmin(id: string, uid: string) {
    this.newAdmins.set(id, uid);
    this.oldIDs.set(id, this.leagues[this.index].id);
    this.deleteReady = this.newAdmins.size === this.leagues.length;
  }

  updatePassword(form: NgForm) {
    this.loading = true;
    this.err = false;
    this.as
      .updatePassword(this.oldPassword, this.newPassword)
      .then(() => {
        form.resetForm();
        this.presentToast();
      })
      .catch((err) => {
        console.log("err: ", err);
        this.err = true;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getLeagueUsers() {
    this.ls.getOwnersLeagues(this.as.getUserId).subscribe((leagues) => {
      if (leagues) {
        const ids = leagues.map((l) => l.leagueId);
        console.log("ids: ", ids);
        this.ls.getUsersByLeagueIDs(ids).subscribe((users) => {
          console.log("users: ", users);
          if (users) {
            users.forEach((u) => {
              if (u.uid !== this.as.getUserId) {
                const arr = this.leagueUsers.get(u.leagueId) || [];
                arr.push(u);
                this.leagueUsers.set(u.leagueId, arr);
              }
            });
          } else this.deleteReady = true;
          this.leagues = leagues.filter((l) =>
            this.leagueUsers.has(l.leagueId)
          );
        });
      } else this.deleteReady = true;
    });
  }

  async updateAdmins() {
    this.newAdmins.forEach(async (uid: string, newID: string) => {
      const oldID = this.oldIDs.get(newID);
      await this.ls.updateAdmin(oldID, newID, uid);
    });
  }

  async deleteAccount() {
    await this.updateAdmins();
    localStorage.clear();
    await this.router.navigateByUrl("/", { replaceUrl: true });
    await this.as.deleteUser();
  }
}
