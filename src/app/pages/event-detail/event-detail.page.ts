import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SportsEvent } from "src/app/models/event";
import { EspnService } from "src/app/services/espn.service";

@Component({
  selector: "app-event-detail",
  templateUrl: "./event-detail.page.html",
  styleUrls: ["./event-detail.page.scss"],
})
export class EventDetailPage implements OnInit {
  event: SportsEvent;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private espn: EspnService
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.event = this.router.getCurrentNavigation().extras.state.event;
        console.log(" this.event: ", this.event);
        this.getTeamsInfo();
      } else this.router.navigate(["/tabs/events"]);
    });
  }
  segmentChanged(event) {
    console.log("event: ", event);
  }
  getTeamsInfo() {
    this.espn.getTeamInfo(this.event.teams[0].id).then((info) => {
      this.event.teams[0].record = info.record;
      this.event.teams[0].standingSummary = info.summary;
      this.event.teams[0].stats = info.stats;
    });
    this.espn.getTeamInfo(this.event.teams[1].id).then((info) => {
      this.event.teams[1].record = info.record;
      this.event.teams[1].standingSummary = info.summary;
      this.event.teams[1].stats = info.stats;
    });
  }
  ngOnInit() {}
}
