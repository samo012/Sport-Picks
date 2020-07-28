import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/user";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
})
export class RegisterPage implements OnInit {
  model = new User();
  socialRegister = true;
  confirm: string;

  constructor(
    private as: AuthService,
    private router: Router,
    public alertController: AlertController
  ) {}

  ngOnInit() {}
  async submit() {
    try {
      console.log(this.model);
      await this.as.registerUser(this.model, this.socialRegister);
      this.router.navigate(["home/tabs/leagues"]);
    } catch (e) {
      this.presentAlert(e);
    }
  }
  async signUpWithGoogle() {
    const user = await this.as.signInWithGoogle();
    this.model.first = user.displayName.split(" ")[0];
    this.model.last = user.displayName.split(" ")[1];
    this.model.email = user.email;
    this.model.photo = user.photoURL;
  }
  async singUpWithApple() {
    this.model = await this.as.signInWithApple();
  }
  async signUpWithFacebook() {
    const user = await this.as.signInWithFacebook();
    this.model.first = user.displayName.split(" ")[0];
    this.model.last = user.displayName.split(" ")[1];
    this.model.email = user.email;
    this.model.photo = user.photoURL;
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
