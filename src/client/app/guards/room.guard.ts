import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { Observable, of, Subject} from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { RoomPasswordDialogComponent } from '../dialogs/room-password/room-password-dialog.component';
import { ApiService } from '../shared/api.service';

@Injectable({
  providedIn: 'root',
})
export class RoomGuard implements CanActivate {

  input;

  constructor(private api: ApiService,
              private router: Router,
              private sb: MatSnackBar,
              public dialog: MatDialog) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      this.api.redirectUrl = state.url;

      return this.api.get(`roomExists/${next.params.id}`).pipe(
        flatMap((res) => {
          console.log(next.paramMap);
          console.log('roomExists response: ' + JSON.stringify(res));
          if (res.exists === true) {
            if (res.isPublic === false) {
              if (res.access === true) {
                return of(true);
              }
              console.log('Opening dialog..');

              return this.openDialog(next.params.id);
              // if(this.input){
              //   return this.verifyPassword(this.input, next.params.id);
              // }else{
              //   return Observable.create(false);
              // }
            } else {
              return of(true);
            }
          } else {
            this.router.navigate(['/rooms']);
            this.sb.open(res.message, 'Close', {duration: 2500});
            return of(false);
          }
        }),
      );
    }

  openDialog(roomID: string): Observable<boolean> {
      const dialogRef = this.dialog.open(RoomPasswordDialogComponent, {
        //  data: {name: this.name, animal: this.animal}
      });

      return dialogRef.afterClosed().pipe(flatMap(
        ((result) => {
        console.log('The dialog was closed.. result: ' + result);
        if (!result) {
          // this.router.navigate(['/rooms']);
          return of(false);
        }
        return this.verifyPassword(result, roomID);
      })),
      );
    }

    // openDialog(): void {
    //   const dialogRef = this.dialog.open(RoomPasswordDialogComponent, {
    //     width: '50%', height: '50%'
    //     //  data: {name: this.name, animal: this.animal}
    //   });

    //   dialogRef.afterClosed().subscribe(result => {
    //     console.log('The dialog was closed');
    //     this.input = result;
    //   });
    // }

  verifyPassword(input: string, rmID: string): Observable<boolean> {
      return this.api.post('checkRoomPassword', {rmPw: input, roomID: rmID}).pipe(
        map((res) => {
          console.log('Response from checkRoomPassword req: ' + res);
          if (res.access) {
            this.sb.open('Access granted.', 'Close', {duration: 2000});
            return true;
          } else {
            // TODO: add a try again button to snackbar
            if (input) {
              this.sb.open('The password you entered is incorrect.', 'Close', {duration: 2500});
              this.router.navigate(['/rooms']);
              return false;
            }
          }
        }),
      );
    }
  }
