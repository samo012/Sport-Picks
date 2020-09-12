import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "notNumber",
})
export class NotNumberPipe implements PipeTransform {
  transform(value: any) {
    if (value && value[0]) return isNaN(value[0]);
    else return false;
  }
}
