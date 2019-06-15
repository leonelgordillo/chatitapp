import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';

import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { throwError } from 'rxjs'; // Observable?
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiService {

  private baseUrl = environment.wsUrl + environment.apiUrl;
  private STORAGE_KEY = 'SESSIONID';
  private REFRESH_KEY = 'REFRESHID';

  private statusSource = new Subject<boolean>();
  currentStatus = this.statusSource.asObservable();

  private usernameSource$ = new  BehaviorSubject<string>('');
  currentUsername = this.usernameSource$.asObservable();

  public redirectUrl;

  constructor(
              private http: HttpClient,
              private sb: MatSnackBar,
              private router: Router) { }

  changeStatus(status: boolean) {
    this.statusSource.next(status);
  }

  usernameStream(username: string) {
    this.usernameSource$.next(username);
  }

  get(url: string) {
    return this.request(url, 'GET');
  }

  post(url: string, body: any) {
    return this.request(url, 'POST', body);
  }

  put(url: string, body: Object) {
    return this.request(url, 'PUT', body);
  }

  delete(url: string) {
    return this.request(url, 'DELETE');
  }

  request(url: string, method: string, body?: any) {

    let reportProgess = false;
    const token = sessionStorage.getItem(this.STORAGE_KEY);
    const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
    let responseType;
    let headers = new HttpHeaders();

    const contType = 'application/json';

    const newUrl = `${this.baseUrl}/${url}`;
    // const processData = "false";

    console.log('URL request: ' + url);
    if (url.includes('images') || url.includes('profileimage')) {
      // console.log(`Not adding Content-Type header and setting response type: blob`);
      responseType = 'blob';
      reportProgess = true;
    } else if (url.includes('upload')) {
      reportProgess = true;
    } else {
      headers = headers.append('Content-Type', contType);
    }
    // headers = headers.append('Authorization', `Bearer ${token}` )
    // headers = headers.append('X-Auth-Header', `${refreshToken}` )

    const httpReqOptions = {
      url: newUrl,
      headers,
      responseType,
      credentials: 'include',
      withCredential: true,
      method,
      reportProgess,
      body,
    };

    // console.log("HTTP Request Settings: " + JSON.stringify(httpReqOptions));

    return this.http.request(method, newUrl, httpReqOptions)
      .pipe(
        map((res: any) => {
          // console.log(res);
            return res;
           }),
        // catchError((res:HttpErrorResponse) => this.onRequestError(res))
        );
  }

//   onRequestError(res: HttpErrorResponse){
//     const statusCode = res.status;
//     const body = res.error
//     const statusText = res.statusText;

//     const error = {
//       statusCode: statusCode,
//       error: body.error,
//     };

//     console.log(res);
//     console.log("Status text: " + statusText);

//     if(statusText === "Unauthorized"){
//       this.changeStatus(false);
//       sessionStorage.clear();
//       this.sb.open("Please login to re-authenticate", 'close', {duration:2000});
//       this.router.navigate(['/login']);
//       //return throwError(error);
//     }else{
//       this.sb.open(error.error, 'close', {duration:2000});
//       //this.router.navigate(['/home']);
//       //return throwError(error);

//     }
//     return throwError(error);
//   }
 }
