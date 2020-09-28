import { Component } from "@angular/core";
import {
  IonItemSliding,
  IonSlides,
  ModalController,
  AnimationController,
} from "@ionic/angular";
import { League } from "src/app/models/league";
import { User } from "src/app/models/user";
import { AuthService } from "src/app/services/auth.service";
import { LeagueService } from "src/app/services/league.service";
import { NotificationService } from "src/app/services/notification.service";
import { LeagueModalComponent } from "../league-modal/league-modal.component";

@Component({
  selector: "app-tutorial",
  templateUrl: "./tutorial.component.html",
  styleUrls: ["./tutorial.component.scss"],
})
export class TutorialComponent {
  leagueToJoin: League;
  currUser: User;
  isVisible = false;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  constructor(
    public modalController: ModalController,
    private animationCtrl: AnimationController,
    private ls: LeagueService,
    private as: AuthService,
    private ns: NotificationService
  ) {
    this.getLeague();
  }

  ngAfterViewInit() {
    this.ns.getToken().finally(() => this.firstPageAnimations());
  }

  async firstPageAnimations() {
    const first = this.animationCtrl
      .create()
      .addElement(document.getElementById("first"))
      .duration(1000)
      .beforeStyles({
        opacity: 0,
      })
      .afterStyles({
        opacity: 1,
      })
      .fromTo("opacity", "0", "1");
    const second = this.animationCtrl
      .create()
      .addElement(document.getElementById("second"))
      .duration(1000)
      .beforeStyles({
        opacity: 0,
      })
      .afterStyles({
        opacity: 1,
      })
      .fromTo("opacity", "0", "1");

    const third = this.animationCtrl
      .create()
      .addElement(document.getElementById("third"))
      .duration(600)
      .beforeStyles({
        opacity: 0,
      })
      .afterStyles({
        opacity: 1,
      })
      .fromTo("opacity", "0", "1");

    const fourth = this.animationCtrl
      .create()
      .addElement(document.getElementById("fourth"))
      .duration(800)
      .beforeStyles({
        opacity: 0,
      })
      .afterStyles({
        opacity: 1,
      })
      .fromTo("opacity", "0", "1");

    const fifth = this.animationCtrl
      .create()
      .addElement(document.getElementById("fifth"))
      .duration(800)
      .beforeStyles({
        opacity: 0,
      })
      .afterStyles({
        opacity: 1,
      })
      .fromTo("opacity", "0", "1");
    await first.play();
    await second.play();
    await third.play();
    await fourth.play();
    await fifth.play();
  }

  async changin(slide: IonSlides, slider: IonItemSliding) {
    const index = await slide.getActiveIndex();
    if (index === 1) {
      const el = document.getElementById("selectedTeam");
      const el2 = document.getElementById("selectedTeam2");
      el.classList.remove("selected");
      el2.classList.remove("selected");
      setTimeout(() => {
        el.classList.add("selected");
      }, 600);
      setTimeout(() => {
        el2.classList.add("selected");
      }, 1200);
    }
    if (index === 2) {
      this.isVisible = false;
      setTimeout(() => {
        slider.open("end");
      }, 600);
      setTimeout(() => {
        this.isVisible = true;
      }, 1500);
      setTimeout(() => {
        slider.close();
      }, 2500);
    }
  }

  async openModal(state: number) {
    const modal = await this.modalController.create({
      component: LeagueModalComponent,
      componentProps: { state, fromTutorial: true },
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) this.dismiss();
    });
    return await modal.present();
  }

  dismiss() {
    return this.modalController.dismiss(null, null, "TutorialModal");
  }

  async getLeague() {
    const leagueId = localStorage.getItem("leagueId");
    if (leagueId) {
      const ls = await this.ls.getLeaguesOnce(leagueId);
      if (ls) {
        ls[0].username = "";
        this.leagueToJoin = ls[0];
      }
      this.currUser = await this.as.getUser();
    }
  }

  async join() {
    this.leagueToJoin.uid = this.currUser.uid;
    this.leagueToJoin.token = this.currUser.token;
    await this.ls.join(this.leagueToJoin);
    localStorage.removeItem("leagueId");
    this.dismiss();
  }
}
