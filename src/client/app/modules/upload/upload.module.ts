import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule,
         MatCardModule,
         MatChipsModule,
         MatDialogModule,
         MatIconModule,
         MatListModule,
         MatProgressBarModule,
         MatProgressSpinnerModule} from '@angular/material';
import { DialogComponent } from './dialog/dialog.component';
import { UploadService } from './upload.service';
import { UploadComponent } from './upload/upload.component';

@NgModule({
  imports: [
    CommonModule,
    // BrowserAnimationsModule,

    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  declarations: [DialogComponent, UploadComponent], //
  exports: [UploadComponent],
  entryComponents: [DialogComponent],
  providers: [UploadService],
})
export class UploadModule { }
