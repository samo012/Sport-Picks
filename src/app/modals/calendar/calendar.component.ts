import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { PopoverController, IonSlides } from "@ionic/angular";
import * as moment from "moment";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
})
export class CalendarComponent implements OnInit {
  @ViewChild("dates", { static: false }) slides: IonSlides;
  index: number;
  slideOpts;
  dow = ["S", "M", "T", "W", "Th", "F", "Sa"];
  firstRow = [];
  secondRow = [];
  thirdRow = [];
  fourthRow = [];
  fifthRow = [];
  currDay = moment();
  calDisplay = moment().format("MMM YY");
  calMonth = moment().month();
  hm: HammerManager;
  initialTop: number;
  triggered = false;
  startDate: moment.Moment;
  endDate: moment.Moment;

  constructor(public popoverController: PopoverController) {
    let currMonth = moment().month();
    this.index = currMonth;
    this.slideOpts = {
      initialSlide: currMonth,
      speed: 400,
    };
    this.formatCal(currMonth);
  }
  ionViewDidEnter() {
    //Backdrop Click Listener
    document.addEventListener("click", (event) => this.eventCallback(event));

    // Sliding -y- Feature
    let popover = document.getElementsByClassName(
      "popover-content"
    )[0] as HTMLElement;
    this.initialTop = popover.offsetTop;
    this.hm = new Hammer.Manager(popover);
    this.hm.add(
      new Hammer.Pan({ direction: Hammer.DIRECTION_DOWN, threshold: 1 })
    );

    this.hm.on("panmove", (ev) => this.onPan(ev, popover));
    this.hm.on("panend", () => {
      if (!this.triggered) popover.style.top = "auto";
    });
  }
  dismiss(save: boolean) {
    this.hm.destroy();
    document.removeEventListener("click", this.eventCallback);
    if (save) {
      if (this.endDate.isBefore(this.startDate))
        [this.startDate, this.endDate] = [this.endDate, this.startDate];
      setTimeout(() => {
        this.popoverController.dismiss({
          startDate: moment(this.startDate).format("l"),
          endDate: moment(this.endDate).format("l"),
        });
      }, 800);
    } else this.popoverController.dismiss();
  }
  eventCallback(event) {
    if (event.target.className.includes("popover-wrapper")) this.dismiss(false);
  }
  formatCal(selectedMonth: number) {
    this.emptyArrays();
    var diff = selectedMonth - moment().month();
    if (diff >= 0) {
      var start = moment().add(diff, "months").startOf("month").startOf("week");
      var end = moment().add(diff, "months").endOf("month").endOf("week");
    } else {
      var start = moment()
        .subtract(diff * -1, "months")
        .startOf("month")
        .startOf("week");
      var end = moment()
        .subtract(diff * -1, "months")
        .endOf("month")
        .endOf("week");
    }

    for (let i = 0; start.isBefore(end, "day"); i++) {
      if (i == 0) this.firstRow.push(start.clone());
      else if (i < 7) this.firstRow.push(start.add(1, "day").clone());
      else if (i < 14) this.secondRow.push(start.add(1, "day").clone());
      else if (i < 21) this.thirdRow.push(start.add(1, "day").clone());
      else if (i < 28) this.fourthRow.push(start.add(1, "day").clone());
      else this.fifthRow.push(start.add(1, "day").clone());
    }
    // Manually set lengths just in case
    this.firstRow.length = 7;
    this.secondRow.length = 7;
    this.thirdRow.length = 7;
    this.fourthRow.length = 7;
    this.fifthRow.length = 7;

    this.calMonth = end.subtract(14, "days").month();
    this.calDisplay = end.subtract(14, "days").format("MMM YY");
  }
  selectDate(date: moment.Moment) {
    if (!this.startDate) this.startDate = date;
    else {
      this.endDate = date;
      this.dismiss(true);
    }
  }
  emptyArrays() {
    this.firstRow = [];
    this.secondRow = [];
    this.thirdRow = [];
    this.fourthRow = [];
    this.fifthRow = [];
  }
  back() {
    this.index--;
    this.slides.slidePrev();
    this.formatCal(this.index);
  }
  next() {
    this.index++;
    this.slides.slideNext();
    this.formatCal(this.index);
  }

  ngOnInit() {}
  onPan(event: any, popover: HTMLElement) {
    popover.style.top = this.initialTop + event.deltaY + "px";
    if (event.deltaY > 0) {
      // closing
      if (event.deltaY > 80) {
        this.triggered = true;
        this.dismiss(false);
      }
    }
  }
}
// months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December"
// ];
