import { Component, OnInit, ViewChild } from "@angular/core";
import { EspnService } from "src/app/services/espn.service";
import { SportsEvent } from "src/app/models/event";
import * as moment from "moment";
import { Team } from "src/app/models/team";
import { Router, ActivatedRoute } from "@angular/router";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-events",
  templateUrl: "events.page.html",
  styleUrls: ["events.page.scss"],
})
export class EventsPage implements OnInit {
  loading = true;
  selectedTeams = [];
  // currentDate: string;
  dateEvents = [];
  ogDateEvents = [];

  // length = 0;
  // index = 0;
  leagues: League[];

  constructor(
    private as: AuthService,
    private espn: EspnService,
    private router: Router,
    private route: ActivatedRoute,
    private ls: LeagueService
  ) {}

  ngOnInit() {
    this.getEvents().then(() => this.getRankings());
  }

  getLeagues() {
    this.ls
      .getUsersLeagues(this.as.getUserId)
      .subscribe((leagues) => (this.leagues = leagues));
  }
  viewEvent(event: SportsEvent) {
    this.router.navigate(["detail"], {
      state: { event: event },
      relativeTo: this.route,
    });
  }

  doRefresh(event) {
    this.getEvents()
      .catch((err) => console.log("err: ", err))
      .finally(() => event.target.complete())
      .then(() => this.getRankings());
  }
  async getEvents() {
    this.loading = true;
    const e = [
      this.espn.getEvents("1"),
      this.espn.getEvents("4"),
      this.espn.getEvents("5"),
      this.espn.getEvents("8"),
      this.espn.getEvents("9"),
    ];
    const events: SportsEvent[] = [].concat.apply([], await Promise.all(e));
    events.forEach((ev) => {
      const sliceTime = ev.date.slice(0, 10);
      if (!this.dateEvents[sliceTime]) this.dateEvents[sliceTime] = [];
      if (this.dateEvents[sliceTime].findIndex((f) => f.id === ev.id) < 0)
        this.dateEvents[sliceTime].push(ev);
    });
    this.ogDateEvents = this.dateEvents;
    this.loading = false;
  }
  async getRankings() {
    let ranks = new Map<string, string>(await this.espn.getRankings());
    Object.keys(this.dateEvents).forEach((date) => {
      this.dateEvents[date].forEach((event) => {
        event.teams[0].record = ranks.get(event.teams[0].id);
        event.teams[1].record = ranks.get(event.teams[1].id);
      });
    });
  }

  selectTeam(teams: Team[], index: number, teamIndex: number) {
    console.log("teamIndex: ", teamIndex);
    if (index === 0) {
      teams[0].selected = !teams[0].selected;
      teams[1].selected = false;
      // const i = this.selectedTeams.findIndex((team) => team.id === teams[1].id);
      // if (i >= 0) this.selectedTeams.splice(i, 1);
    } else {
      teams[1].selected = !teams[1].selected;
      teams[0].selected = false;
      // const i = this.selectedTeams.findIndex((team) => team.id === teams[1].id);
      // if (i >= 0) this.selectedTeams.splice(i, 1);
    }
    this.selectedTeams[teamIndex] = teams[index].selected ? teams[index] : null;
  }

  filterConf(event) {
    const val = event.target.value;
    if (val == "All") {
      this.dateEvents = this.ogDateEvents;
      return;
    }
    Object.keys(this.ogDateEvents).forEach((date) => {
      const inGroup = this.dateEvents[date].filter(
        (a) => a.group == this.conferences[val]
      );
      if (inGroup.length > 0) this.dateEvents[date] = inGroup;
      else delete this.dateEvents[date];
    });
  }

  filterWeek(event) {
    const val = event.target.value;
    if (val == "All") {
      this.dateEvents = this.ogDateEvents;
      return;
    }
    Object.keys(this.ogDateEvents).forEach((date) => {
      const inWeek =
        val == moment(date).week() - moment(date).startOf("month").week() + 1;
      if (inWeek) this.dateEvents[date] = this.ogDateEvents[date];
      else delete this.dateEvents[date];
    });
  }

  log() {
    console.log("   this.selectedTeams: ", this.selectedTeams);
  }

  // logScrolling(event) {
  //   if (!this.dates[this.index]) return;
  //   var count = (event.detail.scrollTop / 90) | 0;
  //   if (count >= this.length + this.dateEvents[this.dates[this.index]].length) {
  //     this.length += this.dateEvents[this.dates[this.index]].length;
  //     this.index++;
  //   } else if (this.index > 0 && count < this.length) {
  //     this.length -= this.dateEvents[this.dates[this.index - 1]].length;
  //     this.index--;
  //   }
  //   this.currentDate = this.dates[this.index];
  //   console.log(" this.currentDate : ", this.currentDate );
  // }
  conferences = {
    // "80": "FBS",
    ACC: "1",
    // "151": "American",
    "Big 12": "4",
    "Big Ten": "5",
    // "12": "Conf USA",
    // "18": "FBS Ind",
    // "15": "MAC",
    // "17": "Mt. West",
    SEC: "8",
    "Pac 12": "9",
    // "37": "Sun Belt",
  };
}
