import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard2 implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router,
              private sb: MatSnackBar,
              private api: ApiService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (sessionStorage.getItem('SESSIONID') && sessionStorage.getItem('REFRESHID')) {
        console.log('From auth guard 2');
        return this.auth.validateSession().pipe(
          map((res) => {
          if (res.isLoggedIn === true) {
            this.sb.open('You\'re already logged in!', 'close', {duration: 2000});
            this.api.usernameStream(res.username);
            this.router.navigate(['/home']);
            this.api.changeStatus(true);
            return false;
          }
        }));
      } else {
        return true;
      }
    }
  }
