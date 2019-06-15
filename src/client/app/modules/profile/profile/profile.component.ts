import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatSlideToggleChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { UploadService } from '../../../modules/upload/upload.service';
import { ApiService } from '../../../shared/api.service';
import { MediaService } from '../../../shared/media.service';
import { DialogComponent } from '../../upload/dialog/dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {

  @Input()
  checked: boolean;
  @Output()
  change: EventEmitter<MatSlideToggleChange>;

  allowInv;
  showCreatedRooms;
  profileInfo;
  profileImage;
  showSettings = false;

  constructor(
    private api: ApiService,
    private mediaService: MediaService,
    public sanitizer: DomSanitizer,
    private uploadService: UploadService,
    private uploadDialog: MatDialog,

  ) { }

  ngOnInit() {

    // this.change.subscribe(event =>{
    //   console.log(event);
    // });

    this.api.get('me').subscribe((res) => {
      console.log('Response from /me request: ');
      console.log(res);
      this.profileInfo = res.userInfo;

      this.allowInv = this.profileInfo.preferences.enableInvite;
      this.showCreatedRooms = this.profileInfo.preferences.showCreatedRooms;
      this.mediaService.getProfileImage(this.profileInfo.username).subscribe((res) => {

        this.profileImage = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
        console.log(this.profileImage);
      });
    });

  }
  newToggleValue() {
  }
  togglePreference(value: Event) {

    console.log(value);
    const newStatus = value['checked'];
    const preference = value['source'].id;
    this.api.get(`togglePreference/${preference}/${newStatus}`).subscribe((res) => {
        if (res.message === 'success') {
          if (preference == 'allowInv') {
            this.allowInv = newStatus;
          } else if (preference == 'showCreatedRooms') {
            this.showCreatedRooms = newStatus;
          }
          console.log('Updated ' + preference + ' to: ' + newStatus);
        }
     });

  }

  toggleSettings() {
    if (this.showSettings === false) {
      this.showSettings = true;
    } else {
      this.showSettings = false;
    }
  }

  uploadProfilePic() {

  }

  public openUploadDialog(title: string, path: string, type: string, area: string) {
    const dialogRef = this.uploadDialog.open(DialogComponent, {
      width: '50%', height: '50%', data: {
        title,
        filePath: path,
        type,
        area,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

}
