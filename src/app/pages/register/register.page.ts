import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/user";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
})
export class RegisterPage implements OnInit {
  model = new User();
  socialRegister = true;
  constructor(private as: AuthService, private router: Router) {}

  ngOnInit() {}
  async submit() {
    try {
      console.log(this.model);
      await this.as.registerUser(this.model, this.socialRegister);
      this.router.navigate(["home/tabs/tab1"]);
    } catch (e) {
      console.error(e);
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
}
