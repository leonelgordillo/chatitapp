
import { Injectable } from '@angular/core';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { error } from 'protractor';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as Rx from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { NotificationModel } from '../models/notification.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class UserSocketService {

  // Our socket connection
  public socket;
  messageObservable$;
  messageSubject$ = new Subject<any>();
  messageStream = this.messageSubject$.asObservable();
  private onlineUsers$ = new BehaviorSubject<any>([]);
  onlineUsers = this.onlineUsers$.asObservable();
  private roomUsers$ = new Subject<any>();
  roomUsers = this.roomUsers$.asObservable();
  private roomListUsers$ = new BehaviorSubject<any>({});
  roomListUsers = this.roomListUsers$.asObservable();
  

  private currentRooms$ = new BehaviorSubject<string[]>([]);
  currentRooms = this.currentRooms$.asObservable();

  sbActions = ['Accept', 'Reject'];
  constructor(private auth: AuthService,
              private api: ApiService,
              private sb: MatSnackBar,
              private router: Router,
              private notif: NotificationService) { }
  // Rx.Subject<MessageEvent>
  connectToApp() {

    this.socket = io.connect(
      environment.wsUrl,
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      },
    );

    console.log('Connected to userwebsocket from client.. now authenticating..');

    this.socket.emit('authentication', { token: this.auth.getToken() });
    this.socket.on('authenticated', (socket) => {
      console.log('Userwebsocket connection authenticated');
      this.api.changeStatus(true);
      this.socket.emit('authenticated', null);
      this.socket.emit('connected', null);
    });

    this.socket.on('serverData', (data) => {
      this.api.usernameStream(data.username);
      this.roomListUsers$.next({ online: data.roomUsersList });
      this.onlineUsers$.next(data.onlineUsers);
    });

    this.socket.on('currentRooms', (data) => {
      this.currentRooms$.next(data);
    });

    this.socket.on('disconnected', (user) => {
      console.log('Disconnecting socket: ' + user);
      // this.socket.disconnect();
    });

    this.socket.on('onlineUsersUpdate', (data) => {
      this.onlineUsers$.next(data);
    });

    this.socket.on('newFriendUpdate', (from) => {
      // Create notification HERE!!
      this.sb.open(`You are now friends with ${from}!`, 'Dismiss', {duration: 2000});
      this.notif.getFriendInfo();
    });

    this.socket.on('reqNotification', (info) => {

      const title = 'Friend Request';
      const type = 'friend';
      const message = `${info.from} sent you a friend request`;
      const options = ['Accept', 'Reject'];
      const status = 'unread';

      const notification = new NotificationModel(
        title,
        type,
        message,
        info.from,
        options,
        status,
        info.time,
      );

      console.log('Sending new notification from friend request..');
      this.notif.updateUserNotifications(notification);
      this.receiveFriendRequest(info.from);

      // MOVE THIS TO UPDATE USER NOTIFICATIONS METHOD IN NOTIFICATION SERVICE
    });

    this.socket.on('roomInvite', (info) => {

      console.log('roomInvite payload: ' + JSON.stringify(info));
      const title = 'Room Invite';
      const type = 'invite';
      const message = `${info.from} has invited you to room ${info.roomID}`;
      const options = [info.roomID];
      const status = 'unread';
      const id = info.notificationID;

      const notification = new NotificationModel(
        title,
        type,
        message,
        info.from,
        options,
        status,
        info.time,
        id,
      );

      console.log('Sending new notification from room invite request..');

      const sbRef = this.sb.open(notification.message, 'Join', { duration: 4000 });

      console.log(this.router);

      sbRef.onAction().subscribe(() => {

        // User accept join room
      });

      sbRef.afterDismissed().subscribe((dismissedByAction) => {
        console.log('After dismissed: ');
        console.log(dismissedByAction);

        if (dismissedByAction.dismissedByAction) {
          this.router.navigate([`/rooms/${info.roomID}`]);
        } else {
          this.notif.updateUserNotifications(notification);

        }
      });
    });

    this.socket.on('roomUsersUpdate', (data) => {

      this.roomUsers$.next(data);

      if (data.left) {
        console.log(data.left + ' has left the room.');
      } else {
        console.log(data.joined + ' has joined the room.');
      }
    });

    this.socket.on('roomListUsersUpdate', (data) => {
      this.roomListUsers$.next(data);
    });

    this.socket.on('duplicate', (msg) => {
      this.router.navigate(['/rooms']);
      this.sb.open(msg, 'close', { duration: 2000 });
    });

    // this.socket.on("errormsg", msg =>{
    //   console.log("socket.on errormsg activated!");
    //   this.sb.open(msg.error, 'close', {duration:2000});
    // });

    this.socket.on('message', (data) => {
      // console.log('Received message from WS server: ')
      // console.log(data);
      this.messageSubject$.next(data);
    });

    this.socket.on('unauthorized', (error) => {
      console.log('Socket unauthorized. Make sure you are logged in:' + JSON.stringify(error));
      // this.auth.validateSession().subscribe( res =>{
      //   console.log("Response from validateSession in usersocket service:");
      //   console.log(res);
      // })
      this.api.changeStatus(false);
    });

    // console.log("Value of message obs: " + this.messageObservable$);
    // this.messageObservable$ = new Observable(observer => {

    //     this.socket.on('message', (data) => {
    //       console.log("Received msg from Websocket Server: ");
    //       console.log(data);
    //       observer.next(data);
    //     });

    //   // return () => {
    //   //   this.socket.disconnect();
    //   // }
    // });

    // // We define our Observer which will listen to messages
    // // from our other components and send messages back to our
    // // socket server whenever the 'next()' method is called
    // //Let sockets connect when logged in and stay connected until logged out. (afk etc)

    // let observer = {
    //   next: (data: Object) => {
    //     this.socket.emit('message', (data));
    //   },
    // };
    // this.messageSubject$ = Rx.Subject.create(observer, this.messageObservable$);
  }

  pushMessage(msg: Object) {
    this.messageSubject$.next(msg);
  }

  sendMessage(msg: Object) {
    this.socket.emit('message', (msg));
  }

  receiveFriendRequest(from: string) {

    const reqFrom = from;
    const msg = from + ' has sent you a friend request!';
    const sbRef = this.sb.open(msg, 'Accept!', { duration: 4000 });
    this.notif.getFriendInfo();

    sbRef.onAction().subscribe(() => {
      this.notif.acceptReq(reqFrom).subscribe((res) => {
        console.log('From accept friend response:');
        console.log(res);
        if (res.success == true) {
          // Friend accept was successful!
          this.socket.emit('friendAccepted', from);
          this.notif.getFriendInfo();
        }
      });
    });

    sbRef.afterDismissed().subscribe((dismissedByAction) => {
      console.log('After dismissed: ');
      console.log(dismissedByAction);
    });
  }

  //  openSnackBar(message: string, action:string, response:any) {
  //     let actionSelected:string = action;
  //     let snackBarRef = this.sb.open(message, this.sbActions[action], {duration:3000});;
  //     console.log("response");
  //     console.log(response);
  //     snackBarRef.onAction().subscribe(() => {
  //         if(actionSelected == "view_sf"){
  //             window.open('https://eu12.lightning.force.com/lightning/r/Lead/'+response.id.toString()+'/view', "_blank");
  //         }else if(actionSelected == "view_odoo"){
  //             window.open("https://tienda.prokom.es/web#id="+response["result"].toString()+"&view_type=form&model=crm.lead&action=286");
  //         }
  //     });
  // }

}
