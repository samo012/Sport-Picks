import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/user";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { TutorialComponent } from 'src/app/modals/tutorial/tutorial.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
})
export class RegisterPage implements OnInit {
  model = new User();
  socialRegister = true;
  loading = false;
  confirm: string;
  constructor(
    private as: AuthService,
    private router: Router,
    public alertController: AlertController,
    public modalController: ModalController,
    private keyboard: Keyboard
  ) {}

  ngOnInit() {}

  async submit() {
    this.loading = true;
    this.keyboard.hide();
    try {
      console.log(this.model);
      await this.as.registerUser(this.model, this.socialRegister);
      this.presentTutorial();
    } catch (e) {
      this.presentAlert(e);
    }
    this.loading = false;
  }

  async presentTutorial() {
    const modal = await this.modalController.create({
      id:"TutorialModal",
      component: TutorialComponent,
    });
    return await modal.present();
  }

  async signUpWithGoogle() {
    const user = await this.as.signInWithGoogle();
    this.model.first = user.displayName.split(" ")[0];
    this.model.last = user.displayName.split(" ")[1];
    this.model.email = user.email;
    this.model.photo = user.photoURL;
    return this.submit();
  }
  async signUpWithApple() {
    this.model = await this.as.signInWithApple();
    return this.submit();
  }
  async signUpWithFacebook() {
    const user = await this.as.signInWithFacebook();
    this.model.first = user.displayName.split(" ")[0];
    this.model.last = user.displayName.split(" ")[1];
    this.model.email = user.email;
    this.model.photo = user.photoURL;
    return this.submit();
  }
  async presentAlert(e) {
    var error = "Sign Up Error";
    let buttons: any[] = ["OK"];
    if (e.code == "auth/email-already-in-use") {
      error = "Account Exists";
      buttons.push({
        text: "Login",
        handler: () => this.router.navigate(["/"]),
      });
    }
    const alert = await this.alertController.create({
      header: error,
      message: e.message,
      buttons: buttons,
    });

    await alert.present();
  }
}
