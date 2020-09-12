import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Observable } from "rxjs";
import { User } from "src/app/models/user";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["tabs.page.scss"],
})
export class TabsPage {
  user$: Observable<User>;
  constructor(private as: AuthService) {
    this.user$ = this.as.user$;
  }
}
