import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SportsEvent } from "src/app/models/event";
import { EspnService } from "src/app/services/espn.service";
import { LeagueService } from "src/app/services/league.service";
import * as moment from "moment";
import { League } from "src/app/models/league";

@Component({
  selector: "app-event-detail",
  templateUrl: "./event-detail.page.html",
  styleUrls: ["./event-detail.page.scss"],
})
export class EventDetailPage implements OnInit {
  event: SportsEvent;
  league: League;
  firstId: string;
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
      const state = this.router.getCurrentNavigation().extras.state;
      if (state) {
        this.event = state.event;
        this.firstId = this.event.teams[0].id;
        this.league = state.selectedLeague;
        this.getDate();
        this.getTeamsInfo();
        this.getPicks();
      } else this.router.navigate(["/tabs/events"]);
    });
  }

  getDate() {
    if (this.event.status == "Postponed") {
      this.started = false;
      this.gameStart = "Game Postponed";
    } else if (
      this.event.status == "Final" ||
      moment().isAfter(this.event.date)
    ) {
      this.started = true;
    } else {
      this.started = false;
      const daysfromNow = Math.abs(moment().diff(this.event.date, "days"));
      this.gameStart =
        daysfromNow > 10
          ? "Game starts in" + daysfromNow + " days"
          : "Game starts " + moment(this.event.date).calendar();
    }
  }
  getTeamsInfo() {
    this.espn
      .getTeamInfo(this.league.sport, this.event.teams[0].id)
      .then((info) => {
        this.event.teams[0].record = info.record;
        this.event.teams[0].standingSummary = info.summary;
        // this.event.teams[0].stats = info.stats;
        this.event.teams[0].rank = info.rank;
      });
    this.espn
      .getTeamInfo(this.league.sport, this.event.teams[1].id)
      .then((info) => {
        this.event.teams[1].record = info.record;
        this.event.teams[1].standingSummary = info.summary;
        // this.event.teams[1].stats = info.stats;
        this.event.teams[1].rank = info.rank;
      });
  }
  getPicks() {
    this.ls.getUsersByLeagueId(this.league.leagueId).subscribe((users) => {
      this.first = [];
      this.second = [];
      if (users) {
        var rank = 1;
        for (let index = 0; index < users.length; index++) {
          const user = users[index];
          if (index === 0) user.rank = 1;
          else if (user.points !== users[index - 1].points) {
            rank = rank + 1;
            user.rank = rank;
          } else user.rank = rank;
          if (user.picks) {
            const found = user.picks.find((p) => p.eventId == this.event.id);
            if ((found && found.visible) || (found && this.started)) {
              if (found.teamId == this.firstId) this.first.push(user);
              else this.second.push(user);
            }
          }
        }
      }
    });
    // this.ls
    //   .getPicksByEvent(this.event.id, this.event.teams[0].id)
    //   .subscribe((first) => {
    //     this.first = first;
    //     console.log("first: ", first);
    //   });
    // this.ls
    //   .getPicksByEvent(this.event.id, this.event.teams[1].id)
    //   .subscribe((second) => {
    //     this.second = second;
    //     console.log("second: ", second);
    //   });
  }
  ngOnInit() {}
}
