import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationModel } from '../../models/notification.model';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';
import { FriendService } from '../../shared/friend.service';
import { NotificationService } from '../../shared/notification.service';
import { UserSocketService } from '../../shared/usersocket.service';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {

    notificationList: NotificationModel[] = [];

    constructor(
        private api: ApiService,
        private notif: NotificationService,
        private userWs: UserSocketService,
        private sb: MatSnackBar,

    ) { }

    ngOnInit() {

        this.notif.notifications.subscribe((notification) => {
            console.log('notification:');
            console.log(notification);
            if (notification) {
                this.notificationList.push(notification);
                this.notif.updateNotificationCount(this.notificationList.length);
            }
        });
        this.notif.getNotifications();
    }

    rejectFriendRequest(from: string) {
        this.notif.rejectReq(from);
    }

    acceptFriendRequest(from: string) {
        this.notif.acceptReq(from).subscribe((res) => {
            console.log(res);
            if (res.success == true) {
                this.userWs.socket.emit('friendAccepted', from);
                this.sb.open('You are now friends with ' + from + '!', 'Dismiss', {duration: 2000});
            }
            this.notif.getFriendInfo();
        });
    }

    removeNotification(id: string) {

        console.log('notification ID: ' + id);

        this.api.get(`removeNotification/${id}`).subscribe((res) => {
            if (res.success = true) {
                for (let i = 0; i < this.notificationList.length; i++) {
                    if (this.notificationList[i]._id == id) {
                        this.notificationList.splice(i, 1);
                        this.notif.updateNotificationCount(this.notificationList.length);
                        break;
                    }
                }
            }
        });
    }

    clearNotifications() {
        if (this.notificationList.length > 0) {
            this.api.get('clearNotifications').subscribe((res) => {
                console.log(res);
                this.notificationList = [];
                this.notif.updateNotificationCount(null);

            });
        }
    }

}
