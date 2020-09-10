import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: "cal",
})
export class CalPipe implements PipeTransform {
  transform(current: moment.Moment) {
    if (moment().isSame(current, "day")) return "medium";
    else if (moment().isSame(current, "month")) return "light";
    else return "opaque";
  }
}
