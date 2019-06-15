import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  returnUrl: string;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sb: MatSnackBar,
  ) {}

  loginData = {
    username: '',
    password: '',
  };

  ngOnInit() {
    // if (this.auth.getUserID()){
    //   this.router.navigate(['/rooms'])
    // }
  }

  login() {
    if (this.loginData.username == '' || this.loginData.password == '') {
      this.sb.open('Please enter a username and password.', 'close', {duration: 2000});
    } else {
      this.api.post('authenticate', this.loginData)
        .subscribe((data) => {
          this.auth.setToken(data['token']);
          this.auth.setRefreshToken(data['refreshToken']);
          // console.log("Token from login response: " + data['token']);
          this.api.changeStatus(true);
          if (this.auth.redirectUrl) {
            this.router.navigate([this.auth.redirectUrl]);
          } else {
            this.router.navigate(['rooms']);
          }
      });
    }
  }
}
