import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { UserSocketService } from './usersocket.service';

@Injectable()
export class FriendService {

  private sentFriendReq$ = new BehaviorSubject<string[]>([]);
  sentFriendReq = this.sentFriendReq$.asObservable();
  private recFriendReq$ = new BehaviorSubject<string[]>([]);
  recFriendReq = this.recFriendReq$.asObservable();
  private friendList$ = new BehaviorSubject<Object[]>([]);
  friendList = this.friendList$.asObservable();

  connected$;

  constructor(private router: Router,
              private api: ApiService,
              private userWs: UserSocketService,
              ) { }

  updateFriendList(friendList) {
    this.friendList$.next(friendList);
  }
  updateRecReq(recFriendReq) {
    this.recFriendReq$.next(recFriendReq);
  }
  updateSentReq(sentFriendReq) {
    this.sentFriendReq$.next(sentFriendReq);
  }

  sendFriendReq(user) {
    return this.api.post('sendFriendReq', { user });
  }

  // getFriendInfo() {
  //   this.api.get('friendInfo').subscribe((res) => {
  //     console.log('Friend info:');
  //     console.log(res.friends);
  //     this.updateFriendList(res.friends.friendList);
  //     this.updateRecReq(res.friends.receivedRequests);
  //     this.updateSentReq(res.friends.sentRequests);
  //   });
  // }
  acceptReq(friend: string) {
    return this.api.get(`acceptFriend/${friend}`);
  }

//   acceptFriendRequest(friend: string){
//     this.acceptReq(friend).subscribe((res) => {
//         console.log(res);
//         if (res.success == true) {
//           this.userWs.socket.emit('friendAccepted', friend);
//         }
//         this.getFriendInfo();
//       });
// }
  rejectReq(friend: string) {
    this.api.get(`rejectFriend/${friend}`).subscribe((res) => {

      });
  }
}
