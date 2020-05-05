import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  users = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  search(event: any) {
    const username = event.detail.value.toLowerCase();

    if (username.length > 0) {
      this.userService.searchUsers(username).subscribe((users) => {
        this.users = users;
      });
    } else {
      this.users = [];
    }
  }

}
