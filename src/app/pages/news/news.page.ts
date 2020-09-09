import { Component, OnInit, ViewChild } from "@angular/core";
import { EspnService } from "src/app/services/espn.service";
import { IonContent } from "@ionic/angular";

@Component({
  selector: "app-news",
  templateUrl: "./news.page.html",
  styleUrls: ["./news.page.scss"],
})
export class NewsPage implements OnInit {
  @ViewChild("content") content: IonContent;
  loading = true;
  news = [];
  sport = "NFL";

  constructor(private espn: EspnService) {}

  ngOnInit() {
    this.getNews();
  }
  async getNews() {
    this.news = await this.espn.getNews(this.sport);
    this.content.scrollToTop();
    this.loading = false;
  }
}
