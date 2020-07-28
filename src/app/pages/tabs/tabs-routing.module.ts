import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    children: [
      {
        path: "leagues",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../leagues/leagues.module").then(
                (m) => m.LeaguesPageModule
              ),
          },
        ],
      },
      {
        path: "events",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../events/events.module").then((m) => m.EventsPageModule),
          },
          {
            path: "detail",
            loadChildren: () =>
              import("../event-detail/event-detail.module").then(
                (m) => m.EventDetailPageModule
              ),
          },
        ],
      },
      {
        path: "profile",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../profile/profile.module").then(
                (m) => m.ProfilePageModule
              ),
          },
        ],
      },
      {
        path: "",
        redirectTo: "home/tabs/leagues",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    redirectTo: "home/tabs/leagues",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
