import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoomModel } from '../../../models/room.model';
import { ApiService } from '../../../shared/api.service';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { MediaService } from '../../../shared/media.service';
import { UserSocketService } from '../../../shared/usersocket.service';
import { UtilsService } from '../../../shared/utils.service';
@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent implements OnInit, OnDestroy {

  pageTitle = 'Rooms';
  roomListSub: Subscription;
  roomList: RoomModel[];
  loading: boolean;
  roomImages = {};
  users;
  roomListUsersStream;
  messageStream;
  onlineUsersStream;

  // lets rooms$ = Observable<RoomModel[]>

  constructor(public api: ApiService,
              public utils: UtilsService,
              public mediaService: MediaService,
              private sanitizer: DomSanitizer,
              private userWs: UserSocketService,
              ) { }

  ngOnInit() {
    this._getRoomList();
  }

  ngOnDestroy() {
    this.roomListUsersStream.unsubscribe();
  }

  private _getRoomList() {
    this.loading = true;
    this.roomListSub = this.api.get('rooms').subscribe(
      (res) => {
        this.roomList = res;

        console.log(this.roomList);
        // console.log(this.roomList);
        this.roomList.forEach((room) => {

          switch (room.type) {
            case 'general':
              room.typeView = 'General';
              break;
            case 'twitter':
              room.typeView = 'Twitter Topic';
              break;
            case 'game':
              room.typeView = 'Game Room';
              break;
            default:
              break;
          }
          if (room.imageRef) {
            this.getRoomMedia(room.imageRef, room.roomID).subscribe((res) => {
              room.image = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
            });
            this.loading = false;
          }
          this.mediaService.getProfileImage(room.organizer).subscribe((res) => {
            room.profileImg = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
          });
          room.users = [];
        });

        this.roomListUsersStream = this.userWs.roomListUsers.subscribe((data) => {

          console.log('roomListUsers data:');
          console.log(data);
          if (data.online) {
            for (let i = 0; i < data.online.length; i++) {
              for (let j = 0; j < this.roomList.length; j++) {
                if (data.online[i].roomID == this.roomList[j].roomID) {
                  this.roomList[j].users = data.online[i].users;
                }
              }
            }
          }
        });
      },
      (err) => {
        console.log('Error getting rooms: ' + JSON.stringify(err));
        this.loading = false;
      },
    );
  }
  
  getRoomMedia(imagePath, roomID) {
    return this.mediaService.getRoomMedia(imagePath);
  }
}
