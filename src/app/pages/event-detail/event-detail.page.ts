import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SportsEvent } from "src/app/models/event";
import { EspnService } from "src/app/services/espn.service";
import { LeagueService } from "src/app/services/league.service";
import * as moment from "moment";

@Component({
  selector: "app-event-detail",
  templateUrl: "./event-detail.page.html",
  styleUrls: ["./event-detail.page.scss"],
})
export class EventDetailPage implements OnInit {
  event: SportsEvent;
  first = [];
  second = [];
  segment = "stats";
  gameStart: string;
  started = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private espn: EspnService,
    private ls: LeagueService
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.event = this.router.getCurrentNavigation().extras.state.event;
        this.getDate();
        this.getTeamsInfo();
        this.getPicks();
      } else this.router.navigate(["/tabs/events"]);
    });
  }
  segmentChanged(event) {
    console.log("event: ", event.target.value);
  }
  getDate() {
    let daysfromNow = moment().diff(this.event.date, "days");
    if (daysfromNow > 0) {
      this.started = true;
    } else {
      this.started = false;
      daysfromNow = Math.abs(daysfromNow);
      this.gameStart =
        daysfromNow > 10
          ? daysfromNow + " days"
          : moment(this.event.date).calendar();
    }
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
  getPicks() {
    this.ls
      .getPicksByEvent(this.event.id, this.event.teams[0].id)
      .subscribe((first) => {
        this.first = first;
        console.log("first: ", first);
      });
    this.ls
      .getPicksByEvent(this.event.id, this.event.teams[1].id)
      .subscribe((second) => {
        this.second = second;
        console.log("second: ", second);
      });
  }
  ngOnInit() {}
}
