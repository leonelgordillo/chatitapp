import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { EMPTY, Observable, Subject, throwError  } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { AuthService } from '../shared/auth.service';

@Injectable()

export class AuthInterceptor implements HttpInterceptor {

    authService;
    refreshTokenInProgress = false;

    tokenRefreshedSource = new Subject();
    tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

    constructor(private injector: Injector,
                private router: Router,
                private sb: MatSnackBar,
                private auth: AuthService,
                private api: ApiService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
              'Authorization': `Bearer ${this.auth.getToken()}`,
              'X-Auth-Header': `${this.auth.getRefreshToken()}`,
            },
          });

          // console.log("Request: ");
          // console.log(request);
        return next.handle(request).pipe(
            map((res: any) => {
                // console.log(res);
                return res;
               }),
            catchError((err: any) => {

                const error = err.error;
                if (err.status === 403) {
                    this.auth.setToken(err.error.token);
                    const newRequest = request.clone({
                        setHeaders: {
                          Authorization: `Bearer ${err.error.token}`,
                        },
                      });
                    // console.log(newRequest);
                    return next.handle(newRequest);
                } else if (err.status == 401) {
                    this.api.changeStatus(false);
                    sessionStorage.clear();
                    this.sb.open('Please login to re-authenticate', 'close', {duration: 2000});
                    this.router.navigate(['/login']);
                } else {
                    console.log('Error is not 403 nor 401');
                    this.sb.open(error.error, 'close', {duration: 2000});
                }
                return throwError(err);
            }),
          );

        }
    }
