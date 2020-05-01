import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {

  posts: any[];

  constructor(private postService: PostService) { }

  ngOnInit() {
    this.postService.getPosts().subscribe((posts: any[]) => {
      this.posts = posts;
    });
  }

}
