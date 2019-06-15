import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuard2 } from './guards/auth2.guard';

const routes: Routes = [

  {
    path: 'rooms',
    loadChildren: './modules/rooms/rooms.module#RoomsModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: './modules/profile/profile.module#ProfileModule',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard2],
  },
  {
    path: 'home',
    component: LandingComponent,
  },
  {
    path: 'login',
    // add redirect feature to redirect to user's first/original choice/url
    component: LoginComponent,
    canActivate: [AuthGuard2],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule { }
