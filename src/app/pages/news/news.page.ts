import { Component, OnInit } from "@angular/core";
import { EspnService } from "src/app/services/espn.service";

@Component({
  selector: "app-news",
  templateUrl: "./news.page.html",
  styleUrls: ["./news.page.scss"],
})
export class NewsPage implements OnInit {
  loading = true;
  constructor(private espn: EspnService) {}
  news = [];
  ngOnInit() {
    this.getNews();
  }
  async getNews() {
    this.news = await this.espn.getNews();
    console.log("this.news : ", this.news);
    this.loading = false;
  }
}
