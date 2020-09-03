import { Component, OnInit, Input } from "@angular/core";
import { League } from "src/app/models/league";
import { PopoverController } from "@ionic/angular";
@Component({
  selector: "app-ellipsis-popover",
  templateUrl: "./ellipsis-popover.component.html",
})
export class EllipsisPopover {
  @Input() isAdmin: boolean;
  @Input() sl: League;
  constructor(public popoverController: PopoverController) {}
  dismissPopover(val?: string) {
    this.popoverController.dismiss(val);
  }
}
