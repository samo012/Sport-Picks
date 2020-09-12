import { Component, OnInit } from "@angular/core";
import { NotificationService } from "src/app/services/notification.service";
import { Notification } from "src/app/models/notification";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
})
export class NotificationsPage implements OnInit {
  loading = false;
  constructor(public ns: NotificationService) {}
  ngOnInit() {}
  async clear() {
    this.loading = true;
    await this.ns.clear();
    this.loading = false;
  }
  remove(id: string) {
    return this.ns.delete(id);
  }
}
