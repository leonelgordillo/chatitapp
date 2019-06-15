import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationModel } from '../models/notification.model';
import { ApiService } from './api.service';
import { FriendService } from './friend.service';
import { UserSocketService } from './usersocket.service';

@Injectable()
export class NotificationService {

    private sentFriendReq$ = new BehaviorSubject<string[]>([]);
    sentFriendReq = this.sentFriendReq$.asObservable();
    private recFriendReq$ = new BehaviorSubject<string[]>([]);
    recFriendReq = this.recFriendReq$.asObservable();

    private friendList$ = new BehaviorSubject<Object[]>([]);
    friendList = this.friendList$.asObservable();

    private notificationSource$ = new BehaviorSubject<NotificationModel>(null);
    notifications = this.notificationSource$.asObservable();

    private notificationCountSource$ = new BehaviorSubject<number>(null);
    notificationCount = this.notificationCountSource$.asObservable();

    constructor(private router: Router,
                private api: ApiService,
                private sb: MatSnackBar,
        // private userWs: UserSocketService,
    ) { }

    getNotifications() {
        this.api.get('notifications').subscribe((res) => {

            const notifications = res.notifications;
            console.log(notifications);
            if (notifications.length > 0) {
                notifications.forEach((element) => {
                    element.timestamp = this.formatNotificationDate(element.timestamp);
                    this.notificationSource$.next(element);
                });
            }
        });
    }

    updateNotificationCount(count: number) {

        if (count === 0) {
            this.notificationCountSource$.next(null);
        } else {
            this.notificationCountSource$.next(count);
        }
    }

    // receiveFriendRequest(from: string) {

    //     let reqFrom = from;
    //     const msg = from + ' has sent you a friend request!';
    //     const sbRef = this.sb.open(msg, 'Accept!', { duration: 4000 });
    //     this.getFriendInfo();

    //     sbRef.onAction().subscribe(() => {
    //         this.acceptReq(reqFrom).subscribe((res) => {
    //             console.log('From accept friend response:');
    //             console.log(res);
    //             if (res.success == true) {
    //                 // Friend accept was successful!
    //                 this.userWs.socket.emit('friendAccepted', from);
    //                 this.getFriendInfo();
    //             }
    //         });
    //     });

    //     sbRef.afterDismissed().subscribe((dismissedByAction) => {
    //         console.log('After dismissed: ');
    //         console.log(dismissedByAction);
    //     });
    // }

    updateUserNotifications(notification: NotificationModel) {

        this.api.post('notifications', { notification }).subscribe((res) => {
            const notification = res.notification;
            console.log('Notification from backend: ');
            console.log(notification);

            console.log(notification.timestamp);

            // var date: Date = new Date(notification.timestamp);

            // var dd = date.getDate();
            // var mm = date.getMonth() + 1; //January is 0!
            // var day, month, stringDate;
            // var yyyy = date.getFullYear();
            // // if (dd < 10) {
            // //     day = '0' + dd;
            // // }
            // // if (mm < 10) {
            // //     month = '0' + mm;
            // // }
            // stringDate = mm + '/' + dd  + '/' + yyyy;

            notification.timestamp = this.formatNotificationDate(notification.timestamp);

            this.notificationSource$.next(notification);

        });
    }

    updateRecReq(recFriendReq) {
        this.recFriendReq$.next(recFriendReq);
    }
    updateSentReq(sentFriendReq) {
        this.sentFriendReq$.next(sentFriendReq);
    }
    updateFriendList(friendList) {
        this.friendList$.next(friendList);
    }

    sendFriendReq(user) {
        return this.api.post('sendFriendReq', { user });
    }

    acceptReq(friend: string) {
        return this.api.get(`acceptFriend/${friend}`);
    }

    rejectReq(friend: string) {
        return this.api.get(`rejectFriend/${friend}`);
    }

    removeFriend(notFriend: string) {
        return this.api.get(`removeFriend/${notFriend}`);
    }

    removeNotification(id: string) {
        return this.api.get(`removeNotification/${id}`);
    }

    sendRoomInvite() {

    }

    formatNotificationDate(notificationDate: string) {

        const date: Date = new Date(notificationDate);
        const dd = date.getDate();
        const mm = date.getMonth() + 1; // January is 0!
        const yyyy = date.getFullYear();
        // if (dd < 10) {
        //     day = '0' + dd;
        // }
        // if (mm < 10) {
        //     month = '0' + mm;
        // }
        const stringDate = mm + '/' + dd + '/' + yyyy;
        return stringDate;
    }

    getFriendInfo() {
        this.api.get('friendInfo').subscribe((res) => {
            console.log('Friend info:');
            console.log(res.friends);
            this.updateFriendList(res.friends.friendList);
            this.updateRecReq(res.friends.receivedRequests);
            this.updateSentReq(res.friends.sentRequests);
        });
    }

}
