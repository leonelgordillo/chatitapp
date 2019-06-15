import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {

  form;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private sb: MatSnackBar) {
      this.form = fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, emailValid()]],
        password: ['', Validators.required],
        confirmPass: ['', Validators.required],

    }, {validator: matchingFields('password', 'confirmPass')});
    }

  onSubmit() {

    if (this.form.status == 'INVALID') {

        this.sb.open('Please fill all fields correctly.', 'close', {duration: 2000});
        return;
    }
    const values = this.form.value;

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
    };

    this.api.post('register', payload)
      .subscribe((data) => {
        this.auth.setToken(data['token']);
        this.auth.setRefreshToken(data['refreshToken']);
        this.router.navigate(['/rooms']);
      });
  }
  isValid(control) {
    return this.form.controls[control].invalid && this.form.controls[control].touched;
  }
}

function matchingFields(field1, field2) {
  return (form) => {
      if (form.controls[field1].value !== form.controls[field2].value) {
          return {mismatchedFields: true};
      }
  };
}

function emailValid() {
  return (control) => {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      const result = regex.test(control.value) ? null : { invalidEmail: true };
      return result;
  };
}
