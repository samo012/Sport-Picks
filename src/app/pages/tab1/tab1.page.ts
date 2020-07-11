import { Component } from "@angular/core";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  leagues = [
    {
      name: "First League",
      users: [
        { rank: 1, name: "Andrew Samole" },
        { rank: 2, name: "Pierce Bailey" },
        { rank: 3, name: "Peter Rood" },
        { rank: 4, name: "Jen Butler" },
        { rank: 5, name: "Brooker Bailey" },
        { rank: 6, name: "Linda Bailey" },
        { rank: 7, name: "Adam Samole" },
        { rank: 8, name: "Robert Bailey" },
      ],
    },
    {
      name: "Second League",
      users: [
        { rank: 1, name: "Joe Mama" },
        { rank: 2, name: "Moe Lester" },
        { rank: 3, name: "Ben Dover" },
        { rank: 4, name: "Mike Hawk" },
      ],
    },
    {
      name: "Third League",
      users: [
        { rank: 1, name: "Andrew Samole" },
        { rank: 2, name: "Pierce Bailey" },
        { rank: 3, name: "Peter Rood" },
        { rank: 4, name: "Jen Butler" },
      ],
    },
  ];
  selectedLeague;
  firstTime = false;
  constructor() {
    this.selectedLeague = this.leagues[0];
    // this.firstTime = !this.leagues || this.leagues.length === 0;
    this.firstTime = false;
  }
}
