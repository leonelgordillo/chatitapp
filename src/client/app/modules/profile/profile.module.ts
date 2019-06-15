import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MediaService } from '../../shared/media.service';
import { SharedModule } from '../../shared/shared.module';
import { UploadModule } from '../upload/upload.module';
// import { FriendListComponent } from './friend-list/friend-list.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';

import { PublicProfileComponent } from './public-profile/public-profile.component';

@NgModule({
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    UploadModule,
  ],

  declarations: [AssetListComponent, ProfileComponent, PublicProfileComponent],
  entryComponents: [],
  providers: [MediaService],
})
export class ProfileModule { }
