import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { AlertController } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { User } from "src/app/models/user";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage {
  existing: boolean;
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

  ionViewWillEnter() {
    const email = localStorage.getItem("email");
    if (email) {
      this.model.email = email;
      this.existing = true;
    } else this.existing = false;
  }
  async singInWithApple() {
    try {
      const user = await this.authService.signInWithApple();
      if (user) {
        this.loading = true;
        this.user = await this.authService.getUserDetails(user.uid);
        if (!this.user)
          return this.presentAlert(
            "Not Found",
            "There is no user record corresponding to this email."
          );
        this.goHome();
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
      console.log(e);
      var err = e;
      if (e && e.message) err = e.message;
      else if (e && e.localizedDescription) err = e.localizedDescription;
      return this.presentAlert("Login Error", err);
    }
  }

  async signInWithFacebook() {
    try {
      const user = await this.authService.signInWithFacebook();
      if (user) {
        this.loading = true;
        this.user = await this.authService.getUserDetails(user.uid);
        if (!this.user)
          return this.presentAlert(
            "Not Found",
            "There is no user record corresponding to this email."
          );
        this.goHome();
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
      console.log(e);
      return this.presentAlert("Login Error", e.message);
    }
  }

  async signInWithGoogle() {
    try {
      const user = await this.authService.signInWithGoogle();
      console.log("user: ", user);
      if (user) {
        this.loading = true;
        this.user = await this.authService.getUserDetails(user.uid);
        if (!this.user)
          return this.presentAlert(
            "Not Found",
            "There is no user record corresponding to this email."
          );
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
      else if (e.code == "auth/user-not-found")
        this.presentAlert(
          "Not Found",
          "There is no user record corresponding to this email."
        );
      else if (e.code == "auth/wrong-password")
        this.presentAlert(
          "Incorrect Password",
          "To reset your password, please use the Forgot Password button"
        );
      else this.presentAlert("Login Error", e.message);
    }
  }

  goHome() {
    return this.router.navigate(["home/tabs/leagues"]);
  }

  // ionViewDidEnter() {
  //   if (this.model.email) setTimeout(() => this.pswdField.setFocus(), 400);
  // }
  async resetPassword(email) {
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
