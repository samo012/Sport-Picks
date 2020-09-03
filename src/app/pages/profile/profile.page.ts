import { Component, ViewChild } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { IonInput, IonItemSliding } from "@ionic/angular";

@Component({
  selector: "app-profile",
  templateUrl: "profile.page.html",
  styleUrls: ["profile.page.scss"],
})
export class ProfilePage {
  @ViewChild("display", { static: false }) input: IonInput;
  user: User;
  leagues: League[];
  isThird = this.as.isThirdParty();
  oldUsername: string;

  constructor(public as: AuthService, private ls: LeagueService) {
    this.getUser();
    this.getLeagues();
  }
  getLeagues() {
    this.ls
      .getUsersLeagues(this.as.getUserId)
      .subscribe((leagues) => (this.leagues = leagues));
  }
  getUser() {
    this.as.getUser().then((user) => (this.user = user));
  }
  edit(l: League) {
    this.oldUsername = l.username;
    l.edit = true;
    setTimeout(() => {
      this.input.setFocus();
    }, 500);
  }
  async cancel(l: League, slider: IonItemSliding) {
    await slider.close();
    l.edit = false;
    l.username = this.oldUsername;
  }
  async save(l: League, slider: IonItemSliding) {
    await slider.close();
    l.edit = false;
    this.ls.updateUsername(l.id, l.username);
  }
  leave(l: League) {
    return this.ls.delete(l.id);
  }
}
