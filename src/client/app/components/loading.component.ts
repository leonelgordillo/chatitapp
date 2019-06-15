import { Component, OnInit } from '@angular/core';
// <img src="/client/assets/images/loading.svg">
@Component({
  selector: 'app-loading',
  template: `
    Loading....
  `,
  styles: [`
    :host {
      display: block;
    }
    img {
      display: block;
      margin: 20px auto;
      width: 50px;
    }
  `],
})
export class LoadingComponent {

  constructor() {}

  ngOnInit() {
    console.log('LOADING COMPONENT ACTIVATED');
  }
}
