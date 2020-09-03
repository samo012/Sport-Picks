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
  base =
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/";
  events = new BehaviorSubject<SportsEvent[]>([]);

  constructor(private httpClient: HttpClient) {}

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
  weeks = new Map<string, string>();

  getEvents(): Promise<SportsEvent[]> {
    let params = {
      dates: "2020" + moment().format("MM"),
      groups: "80",
      limit: "900",
    };
    const conferences = ["1", "4", "8"];
    const url = this.base + "scoreboard";
    return this.httpClient
      .get<any>(url, { params: params })
      .pipe(
        tap((data) => {
          data.leagues[0].calendar[0].entries.forEach((e) =>
            this.weeks.set(e.value, e.endDate)
          );
        }),
        map((data) =>
          (data.events as SportsEvent[])
            .filter((g) =>
              g.competitions[0].competitors.some((c) =>
                conferences.includes(c.team.conferenceId)
              )
            )
            // .sort((a, b) => moment(a.date).diff(b.date))
            .map((ev) => {
              return {
                id: ev.id,
                name: ev.name,
                shortName: ev.shortName,
                date: ev.date,
                venue: ev.competitions[0].venue.fullName,
                visible: true,
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
                      rank: teams.curatedRank.current,
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
  }

  // map(data => [id, data.length] as [string, number])
  async getRankings() {
    const url = this.base + "rankings";
    let ranks = new Map<string, { record: string; rank: number }>();
    await this.httpClient
      .get<any>(url)
      .pipe(
        map((data) =>
          data.rankings[0].ranks.map((rank) => {
            ranks.set(rank.team.id, {
              record: rank.recordSummary,
              rank: rank.current,
            });
          })
        )
      )
      .toPromise();
    return ranks;
  }
  getTeamInfo(teamId: string) {
    const url = this.base + "teams/" + teamId;
    return this.httpClient
      .get<any>(url)
      .pipe(
        map((data) => {
          return {
            id: data.team.id,
            record: data.team.record.items
              ? data.team.record.items[0].summary
              : "NA",
            stats: data.team.record.items
              ? data.team.record.items[0].stats
              : "NA",
            summary: data.team.standingSummary,
            rank: data.team.rank as number,
          };
        })
      )
      .toPromise();
  }
  getNews() {
    const url = this.base + "news";
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
}
