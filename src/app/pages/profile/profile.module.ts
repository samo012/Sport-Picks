import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ProfilePage } from "./profile.page";
import { ImagePicker } from "@ionic-native/image-picker/ngx";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: ProfilePage }])
  ],
  declarations: [ProfilePage],
  providers: [ImagePicker]
})
export class ProfilePageModule {}
