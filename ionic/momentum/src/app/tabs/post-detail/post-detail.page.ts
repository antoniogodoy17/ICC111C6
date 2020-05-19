import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { NavController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit {

  user: any;
  post: any;
  postId: string;

  constructor(private authService: AuthService,
              private postService: PostService,
              private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
    this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
    this.getPost(this.postId);
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
    });
  }

  getPost(postId: string) {
    this.postService.getPost(postId).subscribe((post: any) => {
      if (!post) {
        this.navCtrl.navigateRoot(['tabs/profile']);
      }
      this.post = post;
    });
  }

  toggleLike() {
    if (this.post.likes.includes(this.user.id)) {
      this.post.likes = this.post.likes.filter((id: string) => id !== this.user.id);
      this.post.likesCount -= 1;

      this.postService.dislikePost(this.post, this.user.id).then(() => {
        console.log('disliked');
      }).catch((error) => {
        console.log(error);
      });
    } else {
      this.post.likes.push(this.user.id);
      this.post.likesCount += 1;

      this.postService.likePost(this.post, this.user.id).then(() => {
        console.log('liked');
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  deletePost() {
    this.postService.deletePost(this.post).then(() => {
      this.navCtrl.navigateRoot(['tabs', 'profile']);
    });
  }

  refresh(event: any) {
    setTimeout(() => {
      this.getPost(this.postId);
      event.target.complete();
    }, 1000);
  }

  goToProfile(uid: string): void {
    if (uid === this.user.id) {
      this.navCtrl.navigateRoot(['tabs', 'profile']);
    } else {
      this.navCtrl.navigateForward(['tabs', 'profile', uid]);
    }
  }

  async presentActionSheet() {
    let buttons = [
      {
        text: 'Share',
        handler: () => console.log('Share')
      },
      {
        text: 'Copy Link',
        handler: () => console.log('Copy Link')
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => console.log('Cancel')
      }
    ];

    if (this.post.uid === this.user.id) {
      const additionalButtons = [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deletePost()
        },
        {
          text: 'Archive',
          handler: () => console.log('Archive')
        },
        {
          text: 'Edit',
          handler: () => console.log('Edit')
        },
      ];
      buttons = additionalButtons.concat(buttons);
    }

    const actionSheet = await this.actionSheetCtrl.create({ buttons });
    await actionSheet.present();
  }

}
