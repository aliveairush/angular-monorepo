import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-svg-chart-bar',
  imports: [],
  templateUrl: './svg-chart-bar.component.svg',
  styleUrl: './svg-chart-bar.component.scss'
})
export class SvgChartBarComponent {
  chartItems = input.required<Array<{count: number, name: string}>>();

  barHeight = 20;
  barGap = 2;

  $$activeIndex = signal<number | null>(null)
}
