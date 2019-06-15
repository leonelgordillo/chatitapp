import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-room-invite-dialog',
  templateUrl: './room-invite-dialog.component.html',
  styleUrls: ['./room-invite-dialog.component.css'],
})
export class RoomInviteDialogComponent implements OnInit {

  friendList: string[];
  checkboxArray = [];

  constructor(
    public dialogRef: MatDialogRef<RoomInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {

   }

  ngOnInit(): void {

    for (let i = 0; i < this.data.friends.length; i++) {
      this.checkboxArray.push({friend: this.data.friends[i],
                               checked: false});
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {

    const checkedItems = this.checkboxArray.filter((item) => {
      return item.checked;
    });

    console.log(checkedItems);
    this.dialogRef.close(checkedItems);
  }

}
