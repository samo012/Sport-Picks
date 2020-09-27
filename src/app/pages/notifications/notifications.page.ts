import { Component, OnInit } from "@angular/core";
import { NotificationService } from "src/app/services/notification.service";
import { Notification } from "src/app/models/notification";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
})
export class NotificationsPage {
  loading = true;
  notifications: Notification[];
  constructor(
    private ns: NotificationService,
    private as: AuthService,
    private location: Location,
    private router: Router
  ) {
    this.getNotifications();
  }

  getNotifications() {
    this.ns.getNotificaitons(this.as.getUserId).subscribe((ns) => {
      this.notifications = ns;
      this.loading = false;
    });
  }

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
