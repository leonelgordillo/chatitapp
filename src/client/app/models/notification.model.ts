
export class NotificationModel {
    constructor(
      public title: string,
      public type: string,
      public message: string,
      public from: string,
      public options: string[],
      public status: string,
      public timestamp: Date,
      public _id?: string,
    ) { }
  }
