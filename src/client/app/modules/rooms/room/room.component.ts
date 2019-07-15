
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { MessageModel } from '../../../models/message.model';
import { RoomModel } from '../../../models/room.model';

import { RoomInviteDialogComponent } from '../../../dialogs/room-invite/room-invite-dialog.component';
import { YoutubeDialogComponent } from '../../../dialogs/yt-dialog/youtube-dialog.component';
import { ApiService } from '../../../shared/api.service';
import { MediaService } from '../../../shared/media.service';
import { NotificationService } from '../../../shared/notification.service';
import { UserSocketService } from '../../../shared/usersocket.service';
import { DialogComponent } from '../../upload/dialog/dialog.component';
import { UploadService } from '../../upload/upload.service';

import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

import { Directionality } from '@angular/cdk/bidi';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatSidenav,
  MatSidenavContainer,
  MatSnackBar,

} from '@angular/material';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class RoomComponent implements OnInit, AfterViewInit, OnDestroy {

  faCrown = faCrown;
  faYoutube = faYoutube;

  text: string;
  onlineUsers;
  subscriptions = [];
  messages = [];
  currentUsers = [];
  friendsInRoom = [];
  messages$;
  roomID: string;
  roomTopic: string;
  roomInfo;
  roomUsers;
  username;
  friendList = [];
  friendReqSent;
  imgRef;
  embedButton = 'Show Video';
  scrollDisabled = false;
  youtubeURL;
  safeURL;

  dir: Directionality;
  elementRef: ElementRef<HTMLElement>;
  ngZone: NgZone;
  scrollDispatcher: ScrollDispatcher;

  @ViewChild('scrollMe') scrollMe: ElementRef;
  @ViewChild('scrollNav') scrollNav: ElementRef;
  @ViewChild('sideList') sideList: MatSidenav;
  @ViewChild(MatSidenavContainer) sidenavContainer: MatSidenavContainer;

  constructor(private api: ApiService,
              private route: ActivatedRoute,
              private userWs: UserSocketService,
              private notif: NotificationService,
              private router: Router,
              private sb: MatSnackBar,
              private uploadDialog: MatDialog,
              private ytDialog: MatDialog,
              private inviteDialog: MatDialog,
              private uploadService: UploadService,
              private mediaService: MediaService,
              public sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {

    this.subscriptions.push(this.api.currentUsername.subscribe((username) => {
      this.username = username;
    }));

    this.notif.getFriendInfo();

    this.subscriptions.push(this.notif.friendList.pipe(
      distinctUntilChanged(),
    ).subscribe((friendList) => {

      this.friendList = [];

      for (let i = 0; i < friendList.length; i++) {
        this.friendList.push(friendList[i]['username']);
      }
      if (this.roomUsers) {
        this.updateFriendsInRoom();
      }
    }));

    this.subscriptions.push(this.notif.sentFriendReq.pipe(
      distinctUntilChanged(),
    ).subscribe((sentFriendReq) => {
      this.friendReqSent = sentFriendReq;

    }));

    this.subscriptions.push(this.userWs.onlineUsers.pipe(
      distinctUntilChanged(),
    ).subscribe((onlineUsers) => {
      console.log('Online users stream: ' + onlineUsers);
      this.onlineUsers = onlineUsers;

    }));

    this.route.params.subscribe((params) => {
      // GET ROOMID THEN SEND GET REQUEST TO GET ROOM INFO
      //params.id;

      this.userWs.socket.emit('joinRoom', params.id);

      this.api.get(`room/${params.id}`).subscribe((res) => {

        this.roomInfo = res.roomInfo;
        this.username = res.username;
        this.roomID = this.roomInfo.roomID;

        if (this.roomInfo.type === 'yt') {
          this.roomInfo.showEmbed = true;
          this.roomInfo.embedButton = 'Hide Topic';
          if (this.roomInfo.ytUrl) {
            this.roomInfo.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.roomInfo.ytUrl);
          }
        }

        console.log(this.roomInfo);

        res.messages.forEach((message) => {

          const updatedMessage: MessageModel = this.updateMessage(message);
          const formattedTime = new Date(updatedMessage.time);
          updatedMessage.time = formattedTime.toLocaleTimeString();

          this.messages.push(updatedMessage);
        });
      });

      this.subscriptions.push(this.userWs.messageStream.subscribe((msg) => {
        console.log(msg);
        const updatedMessage: MessageModel = this.updateMessage(msg);
        this.messages.push(updatedMessage);
        this.scrollToBottom();
      }));
    });

    this.subscriptions.push(this.userWs.roomUsers.subscribe((users) => {
      this.roomUsers = users;
      this.updateFriendsInRoom();
      const message = {
        // text: text,
        roomID: this.roomID,
        time: new Date().toLocaleTimeString(),
      };

      setTimeout(() => {
        if (users.left) {
          message['mediaType'] = 'leave';
          message['user'] = users.left;
          this.messages.push(message);
        } else if (users.joined) {
          message['mediaType'] = 'join';
          message['user'] = users.joined;
          this.messages.push(message);
        }
        this.scrollToBottom();
      }, 1500);
      console.log(this.roomUsers);
    }));
  }

  ngAfterViewInit() {
    // this.scrollToBottom();
    // console.log("Scrolled to bottom from ngAfterViewInit");

    if (this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollTop !== this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollHeight) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000);
    }
    this.sideList._closedStream.subscribe((obs) => {
      console.log('Sidelist has been closed: ' + obs);
      this.scrollToBottom();

    });
  }

  ngOnDestroy() {
    console.log('Leaving room socket due to component being destroyed');
    this.unsubscribeAll();
    this.userWs.socket.emit('leaveRoom', this.roomID);
  }

  unsubscribeAll() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

  updateFriendsInRoom() {
    this.friendsInRoom = [];
    this.friendList.sort();
    this.roomUsers.online.sort();
    for (let i = 0; i < this.friendList.length; i++) {
      if (this.roomUsers.online.indexOf(this.friendList[i]) > -1) {
        this.friendsInRoom.push(this.friendList[i]);
      }
    }
    return true;
  }

  addFriend(user: string) {
    console.log('Sending friend request to ' + user);

    let friendExists;
    if (this.friendList) {
      friendExists = this.friendList.some(function(el) {
        return el.username === user;
      });
    }

    if (friendExists) {
      console.log('Friend already exists in your friend list!');
    } else {
      this.notif.sendFriendReq(user).subscribe((res) => {
        if (res.error) {
          this.sb.open(res.error, 'OK', { duration: 2000 });
        } else if (res.message) {
          this.sb.open('Friend request sent to ' + res.user + '.', 'OK', { duration: 2000 });
          this.notif.getFriendInfo();
          this.userWs.socket.emit('friendReqFromClient', res.user);
        }
      });
    }
  }

  openFriendInviteDialog() {

    const onlineFriends = [];

    for (let i = 0; i < this.friendList.length; i++) {
      if (this.onlineUsers) {
        if (this.onlineUsers.includes(this.friendList[i])) {
          onlineFriends.push(this.friendList[i]);
        }
      }
    }

    console.log('Online friends: ' + onlineFriends);

    const dialogRef = this.inviteDialog.open(RoomInviteDialogComponent, {
      width: '250px',
      data: {
        friends: onlineFriends,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      // this.youtubeURL = result;
      console.log('Room Invite Result: ' + result);

      const friends = result;
      if (!result) {
        return;
      } else {
        for (let i = 0; i < friends.length; i++) {
        this.sendRoomInvite(friends[i].friend);
        }
      }
    });
  }

  sendRoomInvite(friend: string) {
    console.log('Sending room invite to ' + friend);

    if (friend && this.roomID) {
      this.userWs.socket.emit('roomInviteFromClient', { friend, roomID: this.roomID });
    }
  }

  sendText(text: string) {

    if (this.userWs.socket.connected) {

      if (!text) {
        return;
      } else {
        text = text.trim();
        if (!text) {
          return;
        }
      }

      const message = {
        text,
        mediaType: 'text',
        mediaRef: '',
      };
      this.text = '';
      this.sendMsgToDB(message);
    } else {
      this.sb.open('You are not connected to the room. Try reconnecting.', 'close', { duration: 2000 });
      this.router.navigate(['rooms']);
    }
  }

  sendMedia(mediaRef: string, type: string) {

    console.log('From send image: ' + this.roomID);
    const message = {
      text: '',
      mediaType: type,
      mediaRef,
    };

    if (this.userWs.socket.connected) {
      this.sendMsgToDB(message);
    } else {
      this.sb.open('You are not connected to the room. Try reconnecting.', 'close', { duration: 2000 });
      this.router.navigate(['rooms']);
    }
  }

  uploadMedia() {
    const title = 'Upload Media';
    const path = `rooms/${this.roomID}`;
    const area = 'message-upload';
    this.openUploadDialog(title, path, area);

    const uploadRef = this.uploadService.uploadRef.subscribe((res) => {

      if (!res) {
        console.log('Invalid file type..');
        this.sb.open('Invalid file type.', 'Dismiss', { duration: 1500 });
        uploadRef.unsubscribe();
        return;
      }
      const ref = res['ref'];
      const type = res['type'];
      console.log('Subscribed to uploadRef.. ref: ' + ref);
      // this.imgRef = ref;
      console.log('Media ref from response: ' + ref);
      this.sendMedia(ref, type);
      uploadRef.unsubscribe();
    });
  }

  public getImage(mediaRef: string) {
    return this.mediaService.getRoomMedia(mediaRef);
  }

  sendMsg(msg) {
    this.userWs.sendMessage(msg);
  }

  public openUploadDialog(title: string, path: string, area: string) {
    const dialogRef = this.uploadDialog.open(DialogComponent, {
      data: {
        title,
        filePath: path,
        area,
      },
    });

    // dialogRef.afterClosed().subscribe(() => {
    //   this.scrollToBottom();
    // })
  }

  close(reason: string) {
    this.sideList.close();
  }

  openYTDialog() {
    const dialogRef = this.ytDialog.open(YoutubeDialogComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      // this.youtubeURL = result;
      console.log('YT Diag Result: ' + result);

      if (!result) {
        return;
      }
      const ytID = this.getYoutubeID(result);
      if (ytID) {
        console.log('VALID YOUTUBE URL!');
        const ytURL = `https://youtube.com/embed/${ytID}`;
        this.sendYoutubeLink(ytURL);
      } else {
        console.log('INVALID YOUTUBE URL!!');
        this.sb.open('Not a valid YouTube URL!', 'Dismiss', { duration: 1500 });
      }
    });
  }

  sendYoutubeLink(url: string) {
    console.log('From send image: ' + this.roomID);
    const message = {
      text: '',
      mediaType: 'yt',
      mediaRef: url,
    };

    if (this.userWs.socket.connected) {
      this.api.post(`addMessage/${this.roomID}`, message).subscribe((res) => {
        const msg = res.chatmessage;
        msg.time = new Date(msg.time);
        msg.time = msg.time.toLocaleTimeString();
        msg['roomID'] = this.roomID;
        console.log('msg.mediaRef: ' + msg.mediaRef);
        this.sendMsg(msg);
      });
    } else {
      this.sb.open('You are not connected to the room. Try reconnecting.', 'close', { duration: 2000 });
      this.router.navigate(['rooms']);
    }
  }

  getYoutubeID(url) {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const result = url.match(rx);

    if (result) {
      console.log('Result: ' + result);
      console.log('YOUTUBE ID: ' + result[1]);
      return result[1];
    } else {
      return;
    }
  }

  toggleEmbed(msg: any) {
    if (msg.showEmbed == false) {
      msg.showEmbed = true;
      msg.embedButton = 'Hide Media';
    } else {
      msg.showEmbed = false;
      msg.embedButton = 'Show Media';
    }
  }

  toggleTopic(topic: any) {
    if (topic.showEmbed == false) {
      topic.showEmbed = true;
      topic.embedButton = 'Hide Topic';
    } else {
      topic.showEmbed = false;
      topic.embedButton = 'Show Topic';
    }
  }

  toggleWebm(msg: any) {
    if (msg.showWebm == false) {
      msg.showWebm = true;
      msg.webmButton = 'Hide Media';
    } else {
      msg.showWebm = false;
      msg.webmButton = 'Show Media';
    }
  }

  toggleImgSize(msg: any) {
    if (msg.largeImg == false) {
      msg.largeImg = true;
    } else {
      msg.largeImg = false;
    }
  }

  scrollToBottom() {

    // const notScrolledToBottom = this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollTop !== this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollHeight;
    if (!this.scrollDisabled) {
      setTimeout(() => {
        this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollTop = this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollHeight;
        console.log('Scrolled to bottom..');
      }, 5);
    }
  }

  scroll(el: HTMLElement, show: boolean) {

    if (show) {
      setTimeout(() => {
        el.scrollIntoView();
        this.sidenavContainer.scrollable.getElementRef().nativeElement.scrollTop -= 50;
      }, 1);
    }
  }

  sendMsgToDB(message: any) {
    this.api.post(`addMessage/${this.roomID}`, message).subscribe((res) => {

      console.log('Sending message to DB');
      const msg = res.chatmessage;
      msg.time = new Date(msg.time);
      msg.time = msg.time.toLocaleTimeString();
      msg['roomID'] = this.roomID;
      this.sendMsg(msg);
    });
  }

  updateMessage(msg: any): any {

    switch (msg.mediaType) {
      case 'image':
        this.getImage(msg.mediaRef).subscribe((res) => {
          msg.image = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
          msg['largeImg'] = false;
        });
        break;
      case 'yt':
        msg['showEmbed'] = false;
        msg['embedButton'] = 'Show Video';
        msg['safeUrl'] = this.sanitizer.bypassSecurityTrustResourceUrl(msg.mediaRef);
        console.log('YT Ref: ' + msg.mediaRef);
        break;
      case 'mp4':
      case 'webm':
        this.getImage(msg.mediaRef).subscribe((res) => {
          msg['showWebm'] = false;
          msg['webmButton'] = 'Show Webm';
          msg.media = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
        });
        break;

      default:
        break;
    }
    return msg;
  }

  onImageLoad(index: number) {
    console.log(index);

    setTimeout(() => {
      if ((this.messages.length - 1) == index) {
        this.scrollToBottom();
        console.log('Scrolled on index: ' + index);
      }
    }, 5);

  }
}
