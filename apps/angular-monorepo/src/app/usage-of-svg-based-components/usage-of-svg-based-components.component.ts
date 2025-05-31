import { Component } from '@angular/core';
import { SvgChartBarComponent } from './svg-chart-bar/svg-chart-bar.component';

@Component({
  selector: 'app-usage-of-svg-based-components',
  imports: [SvgChartBarComponent],
  templateUrl: './usage-of-svg-based-components.component.html',
  styleUrl: './usage-of-svg-based-components.component.css',
})
export class UsageOfSvgBasedComponentsComponent {

  readonly chartItems = [
    {count: 3, name: 'Angular'},
    {count: 10, name: 'React'},
    {count: 6, name: 'Css'},
    {count: 20, name: 'html'},
    {count: 1, name: 'Express'},
  ]
}
