import { Component, OnInit } from "@angular/core";
import { EspnService } from "src/app/services/espn.service";
import { SportsEvent } from "src/app/models/event";
import * as moment from "moment";
import { Router, ActivatedRoute } from "@angular/router";
import { LeagueService } from "src/app/services/league.service";
import { League } from "src/app/models/league";
import { AuthService } from "src/app/services/auth.service";
import {
  AlertController,
  IonItemSliding,
  PopoverController,
} from "@ionic/angular";
import { CalendarComponent } from "src/app/modals/calendar/calendar.component";
import { PopEnterAnimation } from "src/app/modals/calendar/pop-enter-animation";
import { PopLeaveAnimation } from "src/app/modals/calendar/pop-leave-animation";

@Component({
  selector: "app-events",
  templateUrl: "events.page.html",
  styleUrls: ["events.page.scss"],
})
export class EventsPage implements OnInit {
  loading = true;
  editMode = false;
  dateEvents = [];
  ogDateEvents = [];
  leagues: League[] = [];
  selectedLeague: League;
  picks = new Map<string, { teamId: string; visible: boolean }>();
  startDate: string;
  endDate: string;
  showAll = false;
  constructor(
    private as: AuthService,
    private espn: EspnService,
    private router: Router,
    private route: ActivatedRoute,
    private ls: LeagueService,
    private ac: AlertController,
    public popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.getLeagues();
  }

  ionViewWillEnter() {
    this.showAll = localStorage.getItem("showAll") === "true";
  }

  async getLeagues() {
    this.ls.usersLeagues.subscribe(async (leagues) => {
      if (leagues === null)
        await this.ls.getUsersLeaguesOnce(this.as.getUserId);
      else if (leagues.length > 0) {
        this.leagues = leagues;
        this.selectedLeague = leagues[0];
        const id = this.route.snapshot.params.id;
        if (id) this.selectedLeague = leagues.find((l) => l.leagueId == id);
        if (!this.selectedLeague) this.selectedLeague = leagues[0];
        this.getEvents(this.startDate, this.endDate);
      } else {
        this.loading = false;
        this.presentAlert(
          "No League",
          "Either create or join a league to start making your picks"
        );
      }
    });
  }

  doRefresh(event) {
    this.getEvents()
      .catch((err) => console.log("err: ", err))
      .finally(() => event.target.complete());
  }

  async openCalendar() {
    const popover = await this.popoverController.create({
      component: CalendarComponent,
      enterAnimation: PopEnterAnimation,
      leaveAnimation: PopLeaveAnimation,
    });
    popover.onDidDismiss().then((data) => {
      if (data.data && data.data.endDate)
        this.getEvents(data.data.startDate, data.data.endDate);
    });
    return await popover.present();
  }

  async getEvents(startDate?: string, endDate?: string) {
    if (!this.selectedLeague) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.dateEvents = [];
    this.ogDateEvents = [];
    this.startDate = startDate;
    this.endDate = endDate;
    const events = await this.espn.getEvents(
      this.selectedLeague.sport,
      startDate || moment().format("l"),
      endDate || moment().add("1", "month").format("l")
    );
    if (events && events.length > 0)
      events.forEach((ev) => {
        const sliceTime = ev.date.slice(0, 10);
        if (!this.dateEvents[sliceTime]) {
          this.dateEvents[sliceTime] = [];
          this.ogDateEvents[sliceTime] = [];
        }
        if (this.selectedLeague.type !== "spread" || ev.odds) {
          this.dateEvents[sliceTime].push(ev);
          this.ogDateEvents[sliceTime].push(ev);
        }
      });
    this.picks = this.selectedLeague.picks
      ? new Map(
          this.selectedLeague.picks.map((i) => [
            i.eventId,
            { teamId: i.teamId, visible: i.visible || false },
          ])
        )
      : new Map();
    this.loading = false;
  }

  async presentAlert(header: string, msg: string) {
    const alert = await this.ac.create({
      header: header,
      message: msg,
      buttons: [
        {
          text: "Ok",
          handler: () => {
            this.router.navigateByUrl("/home/tabs/leagues");
          },
        },
      ],
    });
    await alert.present();
  }

  makeVisible(eventId: string, slider: IonItemSliding) {
    slider.close();
    this.editMode = true;
    let pick = this.picks.get(eventId);
    if (pick.visible === undefined) pick.visible = false;
    pick.visible = !pick.visible;
    this.picks.set(eventId, pick);
  }

  selectTeam(eventId: string, teamId: string, date: string) {
    if (!this.selectedLeague) {
      this.presentAlert(
        "No League",
        "Either create or join a league to start making your picks"
      );
      return;
    }
    if (moment().isBefore(date)) {
      this.editMode = true;
      this.picks.set(eventId, { teamId, visible: this.showAll });
    }
  }

  save() {
    this.editMode = false;
    this.selectedLeague.picks = Array.from(
      this.picks,
      ([eventId, { teamId, visible }]) => ({
        eventId,
        teamId,
        visible,
      })
    );
    return this.ls.savePicks(this.selectedLeague);
  }

  async cancel() {
    this.editMode = false;
    this.getLeagues();
  }

  filterConf(event) {
    const val = event.target.value;
    if (val == "All") {
      this.dateEvents = this.ogDateEvents;
      return;
    }
    Object.keys(this.ogDateEvents).forEach((date) => {
      const inGroup = this.ogDateEvents[date].filter((a: SportsEvent) =>
        a.teams.some((t) => t.group == this.conferences[val])
      );
      if (inGroup.length > 0) this.dateEvents[date] = inGroup;
      else delete this.dateEvents[date];
    });
  }
  clearDate() {
    this.startDate = null;
    this.endDate = null;
    this.getEvents();
  }

  filterWeek(event) {
    const val = event.target.value + "";
    // if (val == "All") {
    //   this.dateEvents = this.ogDateEvents;
    //   return;
    // }
    // Object.keys(this.ogDateEvents).forEach((date) => {
    //   const range = this.weeks.get(val);
    //   const inWeek = moment(date).isBetween(range.start, range.end);
    //   if (inWeek) this.dateEvents[date] = this.ogDateEvents[date];
    //   else delete this.dateEvents[date];
    // });
  }

  // async getRankings() {
  //   const ranks = await this.espn.getRankings();
  //   Object.keys(this.dateEvents).forEach((date) => {
  //     this.dateEvents[date].forEach((event: SportsEvent) => {
  //       const first = ranks.get(event.teams[0].id);
  //       const second = ranks.get(event.teams[1].id);
  //       event.teams[0].record = first ? first.record : null;
  //       event.teams[0].rank = first ? first.rank : null;
  //       event.teams[1].record = second ? second.record : null;
  //       event.teams[1].rank = second ? second.rank : null;
  //     });
  //   });
  // }

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
