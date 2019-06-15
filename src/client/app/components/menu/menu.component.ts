import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinct, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';
import { MediaService } from '../../shared/media.service';
import { NotificationService } from '../../shared/notification.service';
import { UserSocketService } from '../../shared/usersocket.service';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';


// import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit, AfterContentChecked {

  // messages$: Subject<any>;
  messages$;
  connected$;
  loggedIn;
  onlineUsers;
  username;
  profileImg;
  numOfNotifications;
  currentRooms;
  matDrawerModify;

  constructor(private api: ApiService,
              public auth: AuthService,
              public userWs: UserSocketService,
              private sanitizer: DomSanitizer,
              private mediaService: MediaService,
              private notificationService: NotificationService,
              private router: Router,
              private breakpointObserver: BreakpointObserver,
              ) { }

  ngOnInit() {

    console.log("Connecting to app via  ngOnInit.")
    this.userWs.connectToApp();

    setInterval(() => {
      if(this.userWs.socket){
        if(this.userWs.socket.disconnected && this.loggedIn){
          console.log("Socket was disconnected.. reconnecting..");
          console.log("Connecting to app via interval")
          this.userWs.connectToApp();
          // TODO: Reconnect to rooms

        }
    }
    }, 15000);
    this.messages$ = this.userWs.messageSubject$;
    this.api.currentUsername.subscribe((username) => {
      this.username = username;
      // console.log(this.username);

      console.log('Username from api.currentUsername: ' + this.username);
      if (!this.profileImg && this.username) {
        console.log('Getting profile image.');
        this.mediaService.getProfileImage(this.username).subscribe((res) => {
          this.profileImg = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
          console.log(this.profileImg);
        });
      }
    });

    this.notificationService.notificationCount.subscribe((count) => {
      this.numOfNotifications = count;
    });

    this.userWs.currentRooms.subscribe(rooms =>{
      console.log("Current user rooms: ");
      
      // Check if user is connected to rooms if not, connect(join) rooms
      console.log(rooms);
    })

    // this.userWs.onlineUsers.pipe(
    //   distinctUntilChanged()
    // ).subscribe(users => {
    //   this.onlineUsers = users;
    //   console.log(this.onlineUsers)
    // });




    this.api.currentStatus.pipe(
      distinctUntilChanged(),
    ).subscribe((status) => {
      this.loggedIn = status;
      if (this.loggedIn) {
        // if (this.userWs.socket.disconnected) {
        //   this.userWs.connectToApp();

        //   this.messages$ = this.userWs.messageSubject$;
        // } else {
        //   console.log('Menu.component already connected');
        // }
      } else {
        this.api.changeStatus(false);
        if (this.userWs.socket.connected) {
          // Disconnecting socket since user is not logged in
          this.userWs.socket.disconnect();
        }
        // ATTEMPT to implement when more socket configuration is complete
        // this.wsService.socket.disconnect();
      }
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Close side lists here
      }
    });

    this.breakpointObserver
      .observe(['(min-width: 600px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.matDrawerModify = "large";
        } else {
          this.matDrawerModify = "small";
        }
      });
  }

  ngAfterContentChecked() {
    
  }

  logout() {
    this.auth.logout();
  }
}
