import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any;
  posts: any[];

  constructor(private authService: AuthService,
              private postService: PostService,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.getPosts();
    });
  }

  getPosts() {
    this.postService.getPostsByUser(this.user.id).subscribe((posts: any[]) => {
      this.posts = posts;
    });
  }

  goToPost(postId: string) {
    this.navCtrl.navigateForward(['tabs', 'profile', 'post', postId]);
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.navCtrl.navigateRoot(['']);
    });
  }
}
