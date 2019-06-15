import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { UploadModule } from '../upload/upload.module';
import { RoomsRoutingModule } from './rooms-routing.module';

import { RoomInviteDialogComponent } from '../../dialogs/room-invite/room-invite-dialog.component';
import { YoutubeDialogComponent } from '../../dialogs/yt-dialog/youtube-dialog.component';
import { RoomCreateComponent } from './room-create/room-create.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomComponent } from './room/room.component';

import { MediaService } from '../../shared/media.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UploadModule,
    RoomsRoutingModule,
    MatDialogModule,
  ],
  declarations: [ RoomListComponent,
                  RoomComponent,
                  RoomCreateComponent,
                  YoutubeDialogComponent,
                  RoomInviteDialogComponent],
  entryComponents: [YoutubeDialogComponent, RoomInviteDialogComponent],
  providers: [
    MediaService,
  ],
})
export class RoomsModule { }
