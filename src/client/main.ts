import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '../environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
  if (window) {
    window.console.log = function() {};
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
// .then(() =>{
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () =>{
//       navigator.serviceWorker.register('ngsw-worker.js');
//     })
// }
// })
.catch((err) => console.error(err));



