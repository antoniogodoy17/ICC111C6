import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';

import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  user: any;
  displayPhoto: any;
  file: any;
  description: string;
  loadingIndicator: any;
  loading = false;

  constructor(private authService: AuthService,
              private postService: PostService,
              private sanitizer: DomSanitizer,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    const base64 = `data:image/${image.format};base64, ${image.base64String}`;
    this.displayPhoto = this.sanitizer.bypassSecurityTrustResourceUrl(base64);

    const imageBlob = this.base64toBlob(image.base64String);
    this.file = new File([imageBlob], 'test.png', { type: 'image/png' });
  }

  base64toBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });

    return blob;
 }

  async createPost() {
    await this.presentLoading('Sharing your brand new post...');

    if (this.description !== undefined && this.file !== undefined) {
      const newPost = {
        id: null,
        uid: this.user.id,
        username: this.user.username,
        description: this.description,
        pictureUrl: null,
        createdAt: Date.now(),
        tags: [],
        likes: [],
        likesCount: 0
      };

      this.postService.createPost(newPost, this.file).then(() => {
        this.dismissLoading();
        this.presentAlertConfirm('Done!', 'Your post has been shared successfully.');
      }).catch((error) => {
        this.dismissLoading();
        this.presentAlert('Error', error.message);
      });
    } else {
      this.dismissLoading();
      this.presentAlert('Error', 'Please enter a description and a valid image.');
    }
  }

  async presentLoading(body: string) {
    this.loadingIndicator = await this.loadingCtrl.create({
      message: body
    });
    this.loading = true;
    await this.loadingIndicator.present();
  }

  async dismissLoading() {
    this.loading = false;
    await this.loadingIndicator.dismiss();
  }

  async presentAlert(title: string, body: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: body,
      buttons: ['Got It']
    });

    await alert.present();
  }

  async presentAlertConfirm(title: string, body: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: body,
      buttons: [
        {
          text: 'Got It',
          handler: () => {
            this.resetView();
            this.navCtrl.navigateRoot(['tabs']);
          }
        }
      ]
    });

    await alert.present();
  }

  resetView(): void {
    this.description = undefined;
    this.file = undefined;
    this.displayPhoto = undefined;
  }
}
