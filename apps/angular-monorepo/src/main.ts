import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
setTimeout(() => {
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
}, 200) // Just emilation slow download for animation to run
