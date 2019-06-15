export class MessageModel {
    constructor(
      public roomRef: string,
      public user: string,
      public text: string,
      public mediaType: string,
      public mediaRef: string,
      public time: string,
      public showMedia: boolean,
      public showMediaText: string,
      public _id?: string,
    ) { }
  }
