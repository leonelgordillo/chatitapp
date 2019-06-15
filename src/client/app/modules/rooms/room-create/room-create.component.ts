import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { MatChip, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ApiService } from '../../../shared/api.service';
import { AuthService } from '../../../shared/auth.service';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.css'],
})
export class RoomCreateComponent implements OnInit {

  form;
  currentUser;
  isPublic = true;
  selected;
  gameSelected;
  ytUrl;

  roomTypes = [
    { value: 'general', viewValue: 'General Room' },
    { value: 'game', viewValue: 'Game Room' },
    { value: 'yt', viewValue: 'YouTube Topic Room' },
    // {value:"game", viewValue: "Game Room"}
  ];

  gameTypes = [
    { value: 'rps', viewValue: 'Rock, Paper, Scissors' },
    { value: 'draw', viewValue: 'Drawing Game' },
    // {value:"game", viewValue: "Game Room"}
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private fb: FormBuilder,
    private sb: MatSnackBar) {

    this.form = fb.group({

      topic: ['', Validators.required],
      type: ['', Validators.required],
      gameType: [this.gameTypes[0].value],
      ytUrl: [''],
      password: [''],
    });
  }

  ngOnInit() {
  }

  onSubmit() {

    if (this.form.status == 'INVALID') {
      this.sb.open('Please fill all fields correctly.', 'close', { duration: 2000 });
      return;
    }

    const values = this.form.value;

    if (values.password !== '') {
      this.isPublic = false;
    }

    if (values.type !== 'general') {
      if (values.type == 'yt') {
        const ytID = this.getEmbedUrl(values.ytUrl);
        if (ytID == '') {
          this.sb.open('Invalid YouTube URL', 'close', { duration: 2000 });
          return;
        } else {
          this.ytUrl = `https://youtube.com/embed/${ytID}`;
        }
      }
    }

    const payload = {
      roomID: this.randRoomId(),
      topic: values.topic,
      type: values.type,
      ytUrl: this.ytUrl,
      gameType: values.gameType,
      roomDesc: values.roomDesc,
      password: values.password,
      isPublic: this.isPublic,
    };

    this.api.post('createroom', payload)
      .subscribe((data) => {
        console.log('Data from createroom response: ' + JSON.stringify(data));
        this.router.navigate([`/rooms/${payload.roomID}`]);
      });
  }

  isValid(control) {
    return this.form.controls[control].invalid && this.form.controls[control].touched;
  }

  getEmbedUrl(url: string): string {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const result = url.match(rx);

    if (result) {
      return result[1];
    } else {
      return '';
    }
  }

  urlValid() {
    return (control) => {
      const regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

      const result = regex.test(control.value) ? null : { invalidUrl: true };

      console.log('Regex Result: ');
      console.log(result);
      return result;
    };
  }

  private randRoomId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}
