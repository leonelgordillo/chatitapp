import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'room-password-dialog',
    templateUrl: 'room-password-dialog.component.html',
  })
  export class RoomPasswordDialogComponent {

    input;
// @Inject(MAT_DIALOG_DATA) public data: any
    constructor(
      public dialogRef: MatDialogRef<RoomPasswordDialogComponent>) {}

    onNoClick(): void {
      this.dialogRef.close();
    }

    onSubmit(input: string): void {
      this.dialogRef.close(input);
    }
  }
