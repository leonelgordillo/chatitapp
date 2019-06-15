import { Component,  Inject,
  OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'yt-dialog',
  templateUrl: './youtube-dialog.component.html',
})
export class YoutubeDialogComponent {

  url;
  constructor(
    public dialogRef: MatDialogRef<YoutubeDialogComponent>,
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(url: string): void {
    this.dialogRef.close(url);
  }
}
