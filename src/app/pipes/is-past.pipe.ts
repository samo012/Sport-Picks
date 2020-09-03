import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";
@Pipe({
  pure: true,
  name: "isPast",
})
export class IsPastPipe implements PipeTransform {
  transform(value: string) {
    return moment().isAfter(value);
  }
}
