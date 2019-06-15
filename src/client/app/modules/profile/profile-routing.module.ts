import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { UserGuard } from '../../guards/user.guard';
import { SharedModule } from '../../shared/shared.module';
// import { FriendListComponent } from './friend-list/friend-list.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { ProfileComponent } from './profile/profile.component';
import { PublicProfileComponent } from './public-profile/public-profile.component';

const routes: Routes = [
  {
    path: 'me',
    component: ProfileComponent,
    canActivate: [AuthGuard],

  },
  {
    // Get public profile
    path: ':username',
    component: PublicProfileComponent,
    canActivate: [UserGuard],

    // username guard here canActivate: [AuthGuard2]
  },
  {
    path: 'assets',
    component: AssetListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'me',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes),
            SharedModule],
  exports: [RouterModule],
})
export class ProfileRoutingModule { }
