import { Component, OnInit } from "@angular/core";
import { LeagueService } from "src/app/services/league.service";
import { AuthService } from "src/app/services/auth.service";
import { League } from "src/app/models/league";
import { EspnService } from "src/app/services/espn.service";
import { SportsEvent } from "src/app/models/event";

@Component({
  selector: "app-all-picks",
  templateUrl: "./all-picks.page.html",
  styleUrls: ["./all-picks.page.scss"],
})
export class AllPicksPage implements OnInit {
  uid = this.as.getUserId;
  selectedLeague: League;
  leagues: League[];
  loading = true;
  events: SportsEvent[] = [];
  eventNames = new Map<string, { teamName: string; winner: boolean }>();
  picks: Map<
    string,
    Map<string, { teamName: string; winner: boolean }>
  > = new Map();
  users: { uid: string; username: string }[] = [];

  constructor(
    private ls: LeagueService,
    private as: AuthService,
    private espn: EspnService
  ) {
    this.getLeagues();
  }

  getLeagues() {
    this.ls.getUsersLeagues(this.uid).subscribe((leagues) => {
      this.leagues = leagues || [];
      this.selectedLeague = this.leagues[0];
      this.getEvents();
      this.getPicks();
    });
  }

  getPicks() {
    this.loading = true;
    this.ls
      .getPicksByLeagueId(this.selectedLeague.leagueId)
      .subscribe((users) => {
        this.users = [];
        if (users) {
          users.forEach((u) => {
            this.users.push({ uid: u.uid, username: u.username });
            if (u.picks) {
              u.picks.forEach((p) => {
                // if (p.visible || p.win === false || p.win === true) {
                  const map =
                    this.picks.get(u.uid) ||
                    new Map<string, { teamName: string; winner: boolean }>();
                  this.picks.set(
                    u.uid,
                    map.set(p.eventId, this.eventNames.get(p.teamId))
                  );
                // }
              });
            }
          });
        }
        this.loading = false;
      });
  }

  getEvents() {
    this.events = this.espn.events.value;
    this.events.forEach((e) =>
      this.eventNames.set(e.teams[0].id, {
        teamName: e.teams[0].abbr,
        winner: e.teams[0].winner,
      })
    );
  }
  ngOnInit() {}
}
