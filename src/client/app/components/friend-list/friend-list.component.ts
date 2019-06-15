import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../shared/notification.service';
import { UserSocketService } from '../../shared/usersocket.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class FriendListComponent implements OnInit {

  constructor(
               private notif: NotificationService,
               private userWs: UserSocketService,
               ) { }

  friendList;
  friendReqSent;
  friendReqRec;
  friendActivity;
  onlineUsers;

  ngOnInit() {
    this.notif.getFriendInfo();

    this.notif.friendList.subscribe((friendList) => {
      this.friendList = friendList;
    });

    this.notif.recFriendReq.subscribe((recFriendReq) => {
      this.friendReqRec = recFriendReq;
    });

    this.notif.sentFriendReq.subscribe((sentFriendReq) => {
      this.friendReqSent = sentFriendReq;
    });

    this.userWs.onlineUsers.pipe(
      distinctUntilChanged(),
    ).subscribe((users) => {
      this.onlineUsers = users;
    });
  }

  // sendMessage(friend: string) {
  // }

  // removeFriend(friend: string) {
  // }

  removeFriend(notFriend: string) {
    this.notif.removeFriend(notFriend);
  }

  openPrivateChat(friend: string) {

    // Create new component for private messaging

    // this.userWs.socket.emit('sendMessage', friend)
  }

  rejectFriendRequest(from: string) {
    this.notif.rejectReq(from).subscribe((res) => {
      console.log(res);
      this.notif.getFriendInfo();
    });
  }

  acceptFriendReq(friend: string) {
    this.notif.acceptReq(friend).subscribe((res) => {
      console.log(res);
      if (res.success == true) {
        this.userWs.socket.emit('friendAccepted', friend);
      }
      this.notif.getFriendInfo();
    });
  }

}
