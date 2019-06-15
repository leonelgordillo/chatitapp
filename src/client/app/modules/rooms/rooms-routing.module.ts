import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { RoomGuard } from '../../guards/room.guard';
import { RoomCreateComponent } from './room-create/room-create.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomComponent } from './room/room.component';

const routes: Routes = [
  {
    path: '',
    component: RoomListComponent,
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: RoomCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    component: RoomComponent,
    canActivate: [AuthGuard, RoomGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomsRoutingModule { }
