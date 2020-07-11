import { Component, OnInit, ViewChild } from "@angular/core";
import { EspnService } from "src/app/services/espn.service";
import { SportsEvent } from "src/app/models/event";
import * as moment from "moment";
import { Team } from "src/app/models/team";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-events",
  templateUrl: "events.page.html",
  styleUrls: ["events.page.scss"],
})
export class EventsPage implements OnInit {
  loading = true;
  dateEvents = [];
  selectedTeams = [];
  // currentDate: string;
  dates: string[] = [];
  // length = 0;
  // index = 0;

  constructor(
    private espn: EspnService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.getEvents().then(() => this.getRankings());
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
    const events = await this.espn.getEvents();
    events.forEach((ev) => {
      const sliceTime = ev.date.slice(0, 10);
      if (!this.dateEvents[sliceTime]) this.dateEvents[sliceTime] = [];
      this.dateEvents[sliceTime].push(ev);
    });
    console.log("this.dateEvents: ",this.dateEvents);
    this.dates = Object.keys(this.dateEvents);
    this.loading = false;
  }
  async getRankings() {
    let ranks = new Map<string, string>(await this.espn.getRankings());
    this.dates.forEach((date) => {
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
    "80": "FBS",
    "1": "ACC",
    "151": "American",
    "4": "Big 12",
    "5": "Big Ten",
    "12": "Conf USA",
    "18": "FBS Ind",
    "15": "MAC",
    "17": "Mt. West",
    "9": "Pac 12",
    "8": "SEC",
    "37": "Sun Belt",
  };
}
