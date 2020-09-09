import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { EventDetailPage } from "./event-detail.page";
import { RouterModule } from "@angular/router";
import { NotNumberPipe } from "src/app/pipes/not-number.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: "", component: EventDetailPage }]),
  ],
  declarations: [EventDetailPage, NotNumberPipe],
})
export class EventDetailPageModule {}
