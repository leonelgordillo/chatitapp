import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit
  , Output,
  ViewChild} from '@angular/core';
import { MatCardSubtitle, MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
              public uploadService: UploadService,
              public cdr: ChangeDetectorRef,
              public sanitizer: DomSanitizer,

              @Inject(MAT_DIALOG_DATA) public data: any,
              ) {}

  @ViewChild('file') file;

  // State variables
  title;
  filePath;
  area;
  progress = false;
  public uploadedFile: File;
  canBeClosed = true;
  primaryButtonText = 'Submit';
  showCancelButton = true;
  uploadSuccessful = false;
  uploading = false;
  complete = false;
  fileType;
  safeUrl;

  ngOnInit() {
    this.title = this.data.title;
    this.filePath = this.data.filePath;
    this.area = this.data.area;
    this.file.nativeElement.value;

  }

  addFiles() {
    this.file.nativeElement.click();
  }

  removeFile() {
    this.uploadedFile = null;
    this.fileType = null;
    this.safeUrl = null;
    this.file.nativeElement.value = null;
  }

  onFileAdded() {
    this.uploadedFile = this.file.nativeElement.files[0];
    this.fileType = this.file.nativeElement.files[0].type;

    if (this.fileType.includes('image')) {
      this.fileType = 'image';
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.uploadedFile));
    } else if (this.fileType.includes('video')) {
      this.fileType = 'video';
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.uploadedFile));
    }
    console.log(this.file.nativeElement.files);
  }

  closeDialog() {
    if (this.complete) {
      this.dialogRef.close();
      return;
    } else if (!this.uploadedFile) {
      console.log('You must add a file!');
    } else {
      console.log('Sending files to upload service:');
      console.log(this.uploadedFile);
      this.canBeClosed = false;
      this.dialogRef.disableClose = true;
      this.uploading = true;
      // start the upload and set state variables when complete
      console.log('File path from dialog comp: ' + this.filePath);
      this.uploadService.upload(this.uploadedFile, this.filePath).subscribe(() => {
        this.dialogRef.close();
        // this.uploading = false;
        // this.complete = true;
        // this.canBeClosed = true;
        // this.uploadSuccessful = true;
        // this.primaryButtonText = 'Finish';
        // this.dialogRef.disableClose = false;
        // this.showCancelButton = false;
      });
    }

  }

}
