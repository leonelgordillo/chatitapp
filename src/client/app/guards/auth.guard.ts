import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService,
              private api: ApiService,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      this.auth.redirectUrl = state.url;

      return this.auth.validateSession().pipe(
        map((res) => {
        console.log('auth.redirectUrl: ' + this.auth.redirectUrl);
        if (res.isLoggedIn === true) {
          if (res['token']) {
            sessionStorage.setItem('SESSIONID', res['token']);
            console.log('Changing logged in status to true.');
            // this.router.navigate([this.auth.redirectUrl]);
          }
          this.api.changeStatus(true);
          this.api.usernameStream(res.username);
          return true;
        } else {
          this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
          console.log('Changing logged in status to false.');
          this.api.changeStatus(false);
          return false;
        }
      }));
    }
  }
