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

  // events = new BehaviorSubject<Map<string, SportsEvent[]>>(
  //   new Map<string, SportsEvent[]>()
  // );

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

  getEvents(
    sport: string,
    startDate: string,
    endDate: string
  ): Promise<SportsEvent[]> {
    let params = {
      limit: "900",
      dates:
        moment(startDate).format("YYYYMMDD") +
        "-" +
        moment(endDate).format("YYYYMMDD"),
    };
    if (sport === "NCAAF") params["groups"] = "80";
    // const conferences = ["1", "4", "8"];
    const url = this.base + this.sports[sport] + "scoreboard";
    return this.httpClient
      .get<any>(url, { params: params })
      .pipe(
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
              odds: ev.competitions[0].odds
                ? ev.competitions[0].odds[0].details
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
                    linescores: teams.linescores,
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
    // this.events.next(this.events.value.set(sport, events));
    // return events;
  }

  getGameInfo(sport: string, eventId: string) {
    const url = this.base + this.sports[sport] + "summary?event=" + eventId;
    return this.httpClient.get<SingleEvent>(url).toPromise();
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

  // getTeamInfo(sport: string, teamId: string) {
  //   const url = this.base + this.sports[sport] + "teams/" + teamId;
  //   return this.httpClient
  //     .get<any>(url)
  //     .pipe(
  //       map((data) => {
  //         return {
  //           id: data.team.id,
  //           record: data.team.record.items
  //             ? data.team.record.items[0].summary
  //             : "NA",
  //           // stats: data.team.record.items
  //           //   ? data.team.record.items[0].stats
  //           //   : "NA",
  //           summary: data.team.standingSummary,
  //           rank: data.team.rank as number,
  //         };
  //       })
  //     )
  //     .toPromise();
  // }

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
export interface SingleEvent {
  boxscore: {
    players: any[];
    teams: { statistics: { displayValue: string; label: string }[] }[];
  };
  gameInfo;
  drives;
  leaders: any[];
  broadcasts: any[];
  predictor;
  pickcenter: any[];
  againstTheSpread: any[];
  winprobability: any[];
  scoringPlays: any[];
  videos: any[];
  header: {
    competitions: {
      status: { displayClock: string; period: number };
      competitors: any[];
    }[];
  };
  news;
  standings;
}
