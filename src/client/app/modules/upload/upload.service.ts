import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from '../../shared/api.service';

// const url = environment.uploadUrl;

@Injectable()
export class UploadService {

  complete$ = new Subject<boolean>();
  private uploadRef$ = new Subject<Object>();
  uploadRef = this.uploadRef$.asObservable();

  constructor(private api: ApiService) {
    this.complete$.next(false);
   }

  public upload(file: File, path: string): Observable<boolean> {

    const formData: FormData = new FormData();

    if (!file || !path) {
      console.log('Upload failed.');
      this.complete$.next(false);
      this.sendUploadInfo(null);
      return;
    }

    formData.append('file', file, file.name);
    console.log('Appending: ' + file.name);

    this.api.post(`upload/${path}`, formData).subscribe((res) => {

      console.log('Sent to path: upload/' + path);
      console.log('Response from upload POST: ');
      console.log(res);
      if (res.success === true) {
        console.log('Setting progress to complete.');
        // Close the progress-stream if we get an answer from the API
        // The upload is complete$
        this.complete$.next(true);
        console.log('Res.ref: ' + res.ref);
        const resInfo = {
          ref: res.ref,
          type: res.type,
        };
        this.sendUploadInfo(resInfo);
      } else {
        console.log('Upload failed.');
        this.complete$.next(false);
        this.sendUploadInfo(null);
      }
    });
    console.log('From the end of upload()');

    return this.complete$.asObservable();
  }

  sendUploadInfo(ref: Object) {
    console.log('Pushing uploadInfo..');
    this.uploadRef$.next(ref);
    // this.uploadRef$.complete();
  }

}
