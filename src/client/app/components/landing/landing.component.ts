import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {

  constructor(private sb: MatSnackBar) { }

  ngOnInit() {

    if (navigator['standalone'] == false) {
      // iOS device in browser
      this.sb.open('You can add this web app to the Home Screen', '', {duration: 3000});
    }
    if (navigator['standalone'] == undefined) {
      // Not iOS device
      if (window.matchMedia('(display-mode:browser)').matches) {
        // We are in the
        window.addEventListener('beforeinstallprompt', (event) => {
          event.preventDefault();
          const sb = this.sb.open('Do you want to install Chat It App?', 'Install', {duration: 4500});
          sb.onAction().subscribe(() => {
           (event as any).prompt();
           (event as any).userChoice.then((result) => {
             if (result.outcome == 'dismissed') {
               // TODO: Track no installation
             } else {
               // TODO: It was installed
             }
           });

          });
          return false;
        });
      }
    }
  }

}
