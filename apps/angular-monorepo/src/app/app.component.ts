import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  UsageOfSvgBasedComponentsComponent
} from './usage-of-svg-based-components/usage-of-svg-based-components.component';

@Component({
  imports: [RouterModule, UsageOfSvgBasedComponentsComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, scale: 0.9 }),
        animate('500ms ease-in', style({ opacity: 1, scale: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'angular-monorepo';
}
