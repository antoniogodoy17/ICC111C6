import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any;
  posts: any[];
  pageSize = 9;
  upToDate = false;
  loadingIndicator: any;
  loading = false;

  constructor(private authService: AuthService,
              private userService: UserService,
              private postService: PostService,
              private navCtrl: NavController,
              private actionSheetCtrl: ActionSheetController,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.getPosts();
    });
  }

  getPosts() {
    this.postService.getPostsByUserAndPage(this.user.id, null, this.pageSize).subscribe((posts: any[]) => {
      this.posts = posts;
      this.upToDate = posts.length < this.pageSize;
    });
  }

  loadMorePosts(event: any) {
    if (!this.upToDate) {
      const lastPost = this.posts[this.posts.length - 1];

      setTimeout(() => {
        this.postService.getPostsByUserAndPage(this.user.id, lastPost, this.pageSize).subscribe((posts: any[]) => {
          this.posts = this.posts.concat(posts);
          this.upToDate = posts.length < this.pageSize;
          event.target.complete();
        });
      }, 1000);
    } else {
      event.target.complete();
    }
  }

  refresh(event: any) {
    setTimeout(() => {
      this.getPosts();
      event.target.complete();
    }, 1000);
  }

  goToPost(postId: string) {
    this.navCtrl.navigateForward(['tabs', 'profile', 'post', postId]);
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.navCtrl.navigateRoot(['']);
    });
  }

  async getPicture(source: CameraSource): Promise<boolean> {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source
    });

    const imageBlob = this.base64toBlob(image.base64String);
    const file = new File([imageBlob], 'test.jpeg', { type: 'image/jpeg' });

    await this.presentLoading('Changing your profile picture...');

    this.userService.uploadProfilePicture(this.user.id, file).then(() => {
      this.dismissLoading();
      this.presentAlert('Done!', 'Your profile picture has been changed successfully.');
    }).catch((error) => {
      this.dismissLoading();
      this.presentAlert('Error', error.message);
    });

    return;
  }

  base64toBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });

    return blob;
 }

 async removePicture(): Promise<boolean> {
   await this.presentLoading('Removing your profile picture...');

   if (this.user.pictureUrl) {
     this.userService.removeProfilePicture(this.user.id).then(() => {
      this.dismissLoading();
      this.presentAlert('Done!', 'Your profile picture has been removed successfully.');
     }).catch((error) => {
      this.dismissLoading();
      this.presentAlert('Error', error.message);
    });
  } else {
    this.dismissLoading();
    this.presentAlert('Error', `You don't have a profile picture yet.`);
   }

   return;
 }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Change Profile Photo',
      buttons: [
        {
          text: 'Remove Current Photo',
          handler: () => this.removePicture()
        },
        {
          text: 'Take Photo',
          handler: () => this.getPicture(CameraSource.Camera)
        },
        {
          text: 'Choose from Library',
          handler: () => this.getPicture(CameraSource.Photos)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
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
}
