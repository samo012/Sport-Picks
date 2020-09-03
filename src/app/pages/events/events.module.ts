import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EventsPage } from "./events.page";
import { IsPastPipe } from "src/app/pipes/is-past.pipe";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: EventsPage }]),
  ],
  declarations: [EventsPage, IsPastPipe],
})
export class EventsPageModule {}
