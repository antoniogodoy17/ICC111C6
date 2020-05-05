import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { NavController } from '@ionic/angular';
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

  constructor(private authService: AuthService,
              private postService: PostService,
              private activatedRoute: ActivatedRoute,
              private navCtrl: NavController) { }

  ngOnInit() {
    const postId = this.activatedRoute.snapshot.paramMap.get('postId');
    this.getPost(postId);
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

}
