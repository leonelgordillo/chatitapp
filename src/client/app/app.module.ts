
// Modules
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from '@angular/cdk/layout';


// Components
import { AppComponent } from './app.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoadingComponent } from './components/loading.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { NotificationComponent } from './components/notification/notification.component';
import { RegisterComponent } from './components/register/register.component';
import { RoomPasswordDialogComponent } from './dialogs/room-password/room-password-dialog.component';

// Services
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/authinterceptor.service';
import { ApiService } from './shared/api.service';
import { AuthService } from './shared/auth.service';
import { FriendService } from './shared/friend.service';
import { MediaService } from './shared/media.service';
import { NotificationService } from './shared/notification.service';
import { UserSocketService } from './shared/usersocket.service';
import { UtilsService } from './shared/utils.service';

// Material Design Modules
import { MatDialogModule } from '@angular/material';
import {  BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { PrivateChatComponent } from './components/private-chat/private-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    LoginComponent,
    RegisterComponent,
    FriendListComponent,
    LandingComponent,
    LoadingComponent,
    RoomPasswordDialogComponent,
    NotificationComponent,
    PrivateChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutModule,
    MatDialogModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

  ],
  entryComponents: [RoomPasswordDialogComponent],
  providers: [
    ApiService,
    AuthService,
    UtilsService,
    MediaService,
    AuthGuard,
    FriendService,
    UserSocketService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
