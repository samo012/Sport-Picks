import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { AlertController } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { NgModel } from "@angular/forms";
import { User } from "src/app/models/user";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  existing = localStorage.getItem("email") !== null;
  user: User;
  model = new Login();
  loading = false;
  forgot = false;

  constructor(
    public authService: AuthService,
    public router: Router,
    public alertController: AlertController,
    public toastController: ToastController
  ) {}
  ngOnInit() {
    const email = localStorage.getItem("email");
    if (email) this.model.email = email;
    this.authService.getUser().then((user) => (this.user = user));
  }
  async signInWithFacebook() {
    try {
      const user = await this.authService.signInWithFacebook();
      if (user) {
        this.loading = true;
        this.user = await this.authService.getUserDetails(user.uid);
        this.goHome();
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
      console.log(e);
      return this.presentAlert("Login Error", JSON.stringify(e));
    }
  }

  async signInWithGoogle() {
    try {
      const user = await this.authService.signInWithGoogle();
      if (user) {
        this.loading = true;
        this.user = await this.authService.getUserDetails(user.uid);
        this.goHome();
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
      this.presentAlert("Login Error", e.message);
    }
  }
  async login() {
    this.loading = true;
    try {
      this.model.remember
        ? localStorage.setItem("email", this.model.email)
        : localStorage.removeItem("email");
      this.user = await this.authService.signInRegular(this.model);
      this.goHome();
    } catch (e) {
      this.loading = false;
      console.log(e);
      if (e.toString() == "12501" || e.toString() == "User cancelled.") return;
      if (!this.model.email)
        this.presentAlert("Login Error", "Please enter your email address");
      else if (!this.model.password)
        this.presentAlert("Login Error", "Please enter your password");
      else if (e.code == "auth/wrong-password")
        this.presentAlert("Incorrect Password", "");
      else this.presentAlert("Login Error", e.message);
    }
  }
  goHome() {
    return this.router.navigateByUrl("/home");
  }

  async resetPassword(email: NgModel) {
    if (!email.model || email.invalid) {
      this.presentToast("Please enter a valid email", "danger");
      return;
    }
    try {
      await this.authService.resetPassword(email.model);
      await this.presentToast("Password reset sent", "secondary");
      setTimeout(() => (this.forgot = false), 1000);
    } catch (e) {
      await this.presentAlert("Error", e.message);
      setTimeout(() => (this.forgot = false), 1000);
    }
  }
  async presentAlert(title: string, content: string) {
    const alert = await this.alertController.create({
      header: title,
      message: content,
      buttons: ["OK"],
    });
    await alert.present();
  }
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      color: color,
    });
    await toast.present();
  }
}

export class Login {
  email: string;
  password: string;
  remember: boolean = true;
  token: string;
}
