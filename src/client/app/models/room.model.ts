import { SafeUrl } from '@angular/platform-browser';

export class RoomModel {
    constructor(
      public roomID: string,
      public topic: string,
      public users: Object[],
      public roomDesc: string,
      public organizer: string,
      public imageRef: string,
      public image: SafeUrl,
      public password: string,
      public isPublic: boolean,
      public type: string,
      public typeView: string,
      public profileImg: SafeUrl,
      public dateCreated: Date,
      public _id?: string,
    ) { }
  }
