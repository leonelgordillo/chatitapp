import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {

  constructor(private api: ApiService,
              private router: Router,
              private sb: MatSnackBar) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      this.api.redirectUrl = state.url;
      console.log(this.api.redirectUrl);

      return this.api.get(`userExists/${next.params.username}`).pipe(
        map((res) => {
          if (res.exists === true) {
            return true;
          } else {
            this.sb.open('This user doesn\'t exist', 'Close', {duration: 2500});
            this.router.navigate(['/home']);
            return false;
          }
        }),
      );
    }
  }
