import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LeaguesPage } from "./leagues.page";
import { EllipsisPopover } from "src/app/modals/ellipsis-popover/ellipsis-popover.component";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: LeaguesPage }]),
  ],
  declarations: [LeaguesPage, EllipsisPopover],
})
export class LeaguesPageModule {}
