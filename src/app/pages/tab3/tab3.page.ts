import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/user";

@Component({
  selector: "app-tab3",
  templateUrl: "tab3.page.html",
  styleUrls: ["tab3.page.scss"],
})
export class Tab3Page {
  user: User;
  constructor(public as: AuthService) {
    this.as.getUser().then((user) => (this.user = user));
  }
}
