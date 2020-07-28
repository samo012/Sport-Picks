import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";

@Component({
  selector: "app-profile",
  templateUrl: "profile.page.html",
  styleUrls: ["profile.page.scss"],
})
export class ProfilePage {
  user: User;
  constructor(public as: AuthService) {
    this.as.getUser().then((user) => (this.user = user));
  }
}
