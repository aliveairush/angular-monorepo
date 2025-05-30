import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { D3TreeComponent } from './d3/d3-tree.component';

@Component({
  imports: [RouterModule, D3TreeComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'd3-tree-demo';
}
