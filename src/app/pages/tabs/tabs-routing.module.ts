import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    children: [
      {
        path: "news",
        children: [
          {
            path: "",
            loadChildren: () =>
              import("../news/news.module").then((m) => m.NewsPageModule),
          },
          {
            path: "notifications",
            loadChildren: () =>
              import("../notifications/notifications.module").then(
                (m) => m.NotificationsPageModule
              ),
          },
        ],
      },
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
          {
            path: "all-picks",
            loadChildren: () =>
              import("../all-picks/all-picks.module").then(
                (m) => m.AllPicksPageModule
              ),
          },
          {
            path: "notifications",
            loadChildren: () =>
              import("../notifications/notifications.module").then(
                (m) => m.NotificationsPageModule
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
          {
            path: "notifications",
            loadChildren: () =>
              import("../notifications/notifications.module").then(
                (m) => m.NotificationsPageModule
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
          {
            path: "settings",
            loadChildren: () =>
              import("../settings/settings.module").then(
                (m) => m.SettingsPageModule
              ),
          },
          {
            path: "notifications",
            loadChildren: () =>
              import("../notifications/notifications.module").then(
                (m) => m.NotificationsPageModule
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
