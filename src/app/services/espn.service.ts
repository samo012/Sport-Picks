import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, tap } from "rxjs/operators";
import { SportsEvent } from "../models/event";
import * as moment from "moment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EspnService {
  base = "https://site.api.espn.com/apis/site/v2/sports/";

  events = new BehaviorSubject<SportsEvent[]>([]);

  sports = {
    NFL: "football/nfl/",
    NBA: "basketball/nba/",
    NHL: "hockey/nhl/",
    MLB: "baseball/mlb/",
    NCAAF: "football/college-football/",
    NCAAB: "basketball/mens-college-basketball/",
    undefined: "football/college-football/",
  };

  constructor(private httpClient: HttpClient) {}

  weeks = new Map<string, { start: string; end: string }>();

  async getEvents(sport: string): Promise<SportsEvent[]> {
    let params = {
      dates: "2020" + moment().format("MM"),
      limit: "900",
    };
    if (!sport || sport === "NCAAF") params["groups"] = "80";
    // const conferences = ["1", "4", "8"];
    const url = this.base + this.sports[sport] + "scoreboard";
    const events = await this.httpClient
      .get<any>(url, { params: params })
      .pipe(
        tap((data) => {
          if (data.leagues[0].calendar[0].entries)
            data.leagues[0].calendar[0].entries.forEach((e) =>
              this.weeks.set(e.value, { start: e.startDate, end: e.endDate })
            );
        }),
        map((data) =>
          (data.events as SportsEvent[]).map((ev) => {
            return {
              id: ev.id,
              name: ev.name,
              shortName: ev.shortName,
              date: moment(ev.date).format(),
              venue: ev.competitions[0].venue
                ? ev.competitions[0].venue.fullName
                : "",
              headlines: ev.competitions[0].headlines,
              leaders: ev.competitions[0].leaders,
              visible: false,
              status: ev.competitions[0].status.type.shortDetail,
              clock: ev.competitions[0].status.displayClock,
              period: ev.competitions[0].status.period,
              teams: (<any[]>ev.competitions[0].competitors)
                .map((teams) => {
                  return {
                    id: teams.id,
                    winner: teams.winner,
                    name: teams.team.name,
                    abbr: teams.team.abbreviation,
                    group: teams.team.conferenceId,
                    logo: teams.team.logo,
                    score: teams.score,
                    rank: teams.curatedRank ? teams.curatedRank.current : 99,
                    record: teams.records ? teams.records[0].summary : "0-0",
                    homeAway: teams.homeAway,
                    selected: false,
                  };
                })
                .reverse(),
            };
          })
        )
      )
      .toPromise();
    this.events.next(events);
    return events;
  }

  // async getRankings() {
  //   const url = this.base  + "rankings";
  //   let ranks = new Map<string, { record: string; rank: number }>();
  //   await this.httpClient
  //     .get<any>(url)
  //     .pipe(
  //       map((data) =>
  //         data.rankings[0].ranks.map((rank) => {
  //           ranks.set(rank.team.id, {
  //             record: rank.recordSummary,
  //             rank: rank.current,
  //           });
  //         })
  //       )
  //     )
  //     .toPromise();
  //   return ranks;
  // }

  getTeamInfo(sport: string, teamId: string) {
    const url = this.base + this.sports[sport] + "teams/" + teamId;
    return this.httpClient
      .get<any>(url)
      .pipe(
        map((data) => {
          return {
            id: data.team.id,
            record: data.team.record.items
              ? data.team.record.items[0].summary
              : "NA",
            // stats: data.team.record.items
            //   ? data.team.record.items[0].stats
            //   : "NA",
            summary: data.team.standingSummary,
            rank: data.team.rank as number,
          };
        })
      )
      .toPromise();
  }
  getNews(sport: string) {
    const url = this.base + this.sports[sport] + "news";
    return this.httpClient
      .get<any>(url)
      .pipe(
        map((data) =>
          data.articles.map((a) => {
            return {
              images: a.images,
              description: a.description,
              links: a.links,
              headline: a.headline,
            };
          })
        )
      )
      .toPromise();
  }
  // async getAllEvents(): Promise<SportsEvent[]> {
  //   // https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?group=80&limit=900&dates=20200901-20201001
  //   console.log("getting all");
  //   const e = [
  //     this.getEvents("1"), //ACC
  //     this.getEvents("4"), //Big 12
  //     this.getEvents("8"), //SEC
  //     // this.getEvents("5"), //Big Ten
  //     // this.getEvents("9"), //Pac 12
  //   ];
  //   const events = [].concat.apply([], await Promise.all(e));
  //   this.events.next(events);
  //   return events;
  // }
}
