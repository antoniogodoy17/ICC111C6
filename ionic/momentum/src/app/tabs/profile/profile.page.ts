import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonInfiniteScroll } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;

  user: any;
  posts: any[];
  pageSize = 9;
  upToDate = false;

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
    this.postService.getPostsByUserAndPage(this.user.id, null, this.pageSize).subscribe((posts: any[]) => {
      this.posts = posts;
      this.upToDate = posts.length < this.pageSize;
      this.infiniteScroll.disabled = this.upToDate;
      console.log(this.infiniteScroll.disabled);
    });
  }

  loadMorePosts(event: any) {
    if (!this.upToDate) {
      const lastPost = this.posts[this.posts.length - 1];

      setTimeout(() => {
        this.postService.getPostsByUserAndPage(this.user.id, lastPost, this.pageSize).subscribe((posts: any[]) => {
          this.posts = this.posts.concat(posts);
          this.upToDate = posts.length < this.pageSize;
          this.infiniteScroll.disabled = this.upToDate;
          event.target.complete();
        });
      }, 1000);
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
}
