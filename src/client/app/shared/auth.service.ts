import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable()
export class AuthService {

  STORAGE_KEY = 'SESSIONID';
  REFRESH_KEY = 'REFRESHID';
  UID_KEY = 'UID';

  private statusSource = new Subject<boolean>();
  currentStatus = this.statusSource.asObservable();
  connected$;

  public redirectUrl: string;

  constructor(private router: Router,
              private api: ApiService,
              ) { }

  setToken(token: string) {
    sessionStorage.setItem(this.STORAGE_KEY, token);
  }

  changeStatus(status: boolean) {
    this.statusSource.next(status);
  }

  validateSession() {
    return this.api.get('checkSession');
  }

  setUserID(uid) {
    sessionStorage.setItem(this.UID_KEY, uid);
  }

  setRefreshToken(refreshToken) {
    sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  // DELETE THIS SOON
  getUserID() {
    return sessionStorage.getItem(this.UID_KEY);
  }

  // getUsername(){
  //   return this.username;
  // }

// setAuthUsername(res){
//     localStorage.setItem(this.NAME_KEY, res.username);
// }

  getToken() {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  getRefreshToken() {
    return sessionStorage.getItem(this.REFRESH_KEY);
  }

  checkLoggedIn(): Observable<any> {

    return this.api.get('checkSession');
    // return !!sessionStorage.getItem(this.STORAGE_KEY);
  }

  // getTokenExpirationDate(token: string): Date {
  //   const decoded = jwt_decode(token);

  //   console.log("Decoded token: " +  decoded.body);

  //   // Insert if statement returning true if token is invalid

  //   if (decoded.exp === undefined) return null;

  //   const date = new Date(0);
  //   date.setUTCSeconds(decoded.exp);
  //   return date;
  // }

  // isTokenExpired(token?: string): boolean {
  //   if(!token) token = this.getToken();
  //   if(!token) return true;

  //   const date = this.getTokenExpirationDate(token);
  //   if(date === undefined) return false;
  //   return !(date.valueOf() > new Date().valueOf());
  // }

  logout() {
    this.api.get('logout').subscribe((res) => {
      this.redirectUrl = '';
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.REFRESH_KEY);
      sessionStorage.removeItem(this.UID_KEY);
      console.log(res);
      this.api.changeStatus(false);
      this.router.navigate(['/home']);
    });

  }
}
