import { Component } from '@angular/core';
import { SvgChartBarComponent } from './svg-chart-bar/svg-chart-bar.component';
 import { AngularSvgTreeComponent } from '@angular-monorepo/angular-svg-tree';
import { largeTree } from './svg-tree/large-tree.const';
import { tree } from './svg-tree/medium-tree.const';
import { smallTree } from './svg-tree/small-tree.const';

@Component({
  selector: 'app-usage-of-svg-based-components',
  imports: [SvgChartBarComponent, AngularSvgTreeComponent],
  templateUrl: './usage-of-svg-based-components.component.html',
  styleUrl: './usage-of-svg-based-components.component.css',
})
export class UsageOfSvgBasedComponentsComponent {
  readonly chartItems = [
    { count: 3, name: 'Angular' },
    { count: 10, name: 'React' },
    { count: 6, name: 'Css' },
    { count: 20, name: 'html' },
    { count: 1, name: 'Express' },
  ];
  protected readonly largeTree = largeTree;
  protected readonly tree = tree;
  protected readonly smallTree = smallTree;
}
