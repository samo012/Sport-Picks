import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { SportsEvent } from "../models/event";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class EspnService {
  constructor(private httpClient: HttpClient) {}
  base =
    "http://site.api.espn.com/apis/site/v2/sports/football/college-football/";

  getEvents(): Promise<SportsEvent[]> {
    let params = { dates: "20180901", groups: "80", limit: "900" };
    const url = this.base + "scoreboard";
    return this.httpClient
      .get<any>(url, { params: params })
      .pipe(
        map((data) =>
          (data.events as SportsEvent[])
            .sort((a, b) => moment(a.date).diff(b.date))
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
                      name: teams.team.name,
                      abbr: teams.team.abbreviation,
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
  getRankings() {
    const url = this.base + "rankings";
    return this.httpClient
      .get<any>(url)
      .pipe(
        map((data) =>
          data.rankings[0].ranks.map((rank) => {
            return [rank.team.id, rank.recordSummary] as [string, string];
          })
        )
      )
      .toPromise();
  }
  getTeamInfo(teamId: string) {
    const url = this.base + "teams/" + teamId;
    return this.httpClient
      .get<any>(url)
      .pipe(
        map((data) => {
          return {
            id: data.team.id,
            record: data.team.record.items[0].summary,
            stats: data.team.record.items[0].stats,
            summary: data.team.standingSummary,
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
