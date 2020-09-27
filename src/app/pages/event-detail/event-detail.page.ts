import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SportsEvent } from "src/app/models/event";
import { EspnService } from "src/app/services/espn.service";
import { LeagueService } from "src/app/services/league.service";
import * as moment from "moment";
import { League } from "src/app/models/league";
import { Location } from "@angular/common";

@Component({
  selector: "app-event-detail",
  templateUrl: "./event-detail.page.html",
  styleUrls: ["./event-detail.page.scss"],
})
export class EventDetailPage {
  event: SportsEvent;
  league: League;
  firstId: string;
  first = [];
  second = [];
  segment = "stats";
  gameStart: string;
  started = false;
  hasPicks = false;
  odds: string;
  teams = new Map<string, string>();

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
        console.log(" this.event: ", this.event);
        this.firstId = this.event.teams[0].id;
        this.league = state.selectedLeague;
        this.event.teams.forEach((t) => {
          this.teams.set(t.id, t.abbr);
        });
        this.getDate();
        this.getGameInfo();
        this.getPicks();
      } else this.router.navigate(["/tabs/events"]);
    });
  }

  async getGameInfo() {
    const info = await this.espn.getGameInfo(this.league.sport, this.event.id);
    const game = info.header.competitions[0];
    this.event.teams[0].score = game.competitors[1].score;
    this.event.teams[0].linescores = game.competitors[1].linescores;
    this.event.teams[0].stats = info.boxscore.teams[1].statistics;
    this.event.teams[1].score = game.competitors[0].score;
    this.event.teams[1].linescores = game.competitors[0].linescores;
    this.event.teams[1].stats = info.boxscore.teams[0].statistics;
    this.event.clock = game.status.displayClock;
    this.odds = info.pickcenter[0]?.details;
    if (game.status.period) this.event.period = game.status.period;
  }

  doRefresh(event: { target: { complete: () => void } }) {
    this.getGameInfo()
      .catch(() => event.target.complete())
      .then(() => setTimeout(() => event.target.complete(), 1000));
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
            if (found && (found.visible || this.started)) {
              if (found.teamId == this.firstId) this.first.push(user);
              else this.second.push(user);
            }
          }
        }
      }
    });
  }
}
