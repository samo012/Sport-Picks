import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";

@Component({
  selector: "app-profile",
  templateUrl: "profile.page.html",
  styleUrls: ["profile.page.scss"],
})
export class ProfilePage {
  user: User;
  leagues: League[];
  isThird = this.as.isThirdParty();
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
}
