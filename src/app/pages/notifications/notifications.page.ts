import { Component, OnInit } from "@angular/core";
import { NotificationService } from "src/app/services/notification.service";
import { Notification } from "src/app/models/notification";
import { Location } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
})
export class NotificationsPage {
  loading = false;
  constructor(
    public ns: NotificationService,
    private location: Location,
    private router: Router
  ) {}

  goBack(event: Event) {
    event.preventDefault();
    const state: any = this.location.getState();
    if (state.navigationId) this.location.back();
    else this.router.navigateByUrl("/home/tabs/leagues");
  }

  async clear() {
    this.loading = true;
    await this.ns.clear();
    this.loading = false;
  }

  remove(id: string) {
    return this.ns.delete(id);
  }
}
