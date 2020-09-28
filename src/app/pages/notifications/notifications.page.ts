import { Component } from "@angular/core";
import { NotificationService } from "src/app/services/notification.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"]
})
export class NotificationsPage {
  loading = false;
  constructor(public ns: NotificationService) {}

  async clear() {
    this.loading = true;
    await this.ns.clear();
    this.loading = false;
  }

  remove(id: string) {
    return this.ns.delete(id);
  }
}
