import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as d3 from "d3";

interface TreeNode {
  value: number;
  parent?: number;
  children?: TreeNode[];
  _children?: TreeNode[];
}

const treeData: TreeNode = {
  value: 25,
  children: [
    {
      value: 10,
      parent: 25,
      children: [
        { value: 7, parent: 10 },
        { value: 15, parent: 10 },
        { value: 15, parent: 10 }
      ]
    },
    {
      value: 50,
      parent: 25
    }
  ]
};


@Component({
  selector: 'app-d3-tree',
  imports: [CommonModule],
  templateUrl: './d3-tree.component.html',
  styleUrl: './d3-tree.component.css',
})
export class D3TreeComponent  implements AfterViewInit {

  @ViewChild('svg', { static: true }) svgElement!: ElementRef<SVGSVGElement>;

  private margin = { top: 80, bottom: 80 };
  private width = 600;
  private height = 400 - this.margin.top - this.margin.bottom;
  private duration = 750;
  private i = 0;
  private svg: any;
  private root: any;
  private treemap = d3.tree().size([this.width, this.height]);

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgElement.nativeElement)
      .append('g')
      .attr('transform', `translate(0,${this.margin.top})`);

    this.root = d3.hierarchy(treeData, (d: TreeNode) => d.children);
    this.root.x0 = this.width / 2;
    this.root.y0 = 0;

    this.update(this.root);
  }

  private update(source: any): void {
    const treeData = this.treemap(this.root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    nodes.forEach((d: { y: number; depth: number }) => (d.y = d.depth * 100));

    const node = this.svg.selectAll('g.node')
      .data(nodes, (d: any) => d.id || (d.id = ++this.i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.x0},${source.y0})`)
      .on('click', (_event: any, d: any) => this.click(d));

    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .attr('fill', '#fff')
      .attr('stroke', '#4682b4')
      .attr('stroke-width', 3);

    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => d.children || d._children ? -13 : 13)
      .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
      .text((d: any) => d.data.value);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .attr('fill', '#fff')
      .attr('stroke', '#4682b4')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer');

    const nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr('transform', () => `translate(${source.x},${source.y})`)
      .remove();

    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text').style('fill-opacity', 1e-6);

    const link = this.svg.selectAll('path.link')
      .data(links, (d: any) => d.id);

    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .attr('d', () => this.diagonal({ x: source.x0, y: source.y0 }, { x: source.x0, y: source.y0 }));

    linkEnter.merge(link).transition()
      .duration(this.duration)
      .attr('d', (d: any) => this.diagonal(d, d.parent));

    link.exit().transition()
      .duration(this.duration)
      .attr('d', () => this.diagonal({ x: source.x, y: source.y }, { x: source.x, y: source.y }))
      .remove();

    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private diagonal(s: any, d: any): string {
    return `M ${s.x},${s.y}
            C ${(s.x + d.x) / 2},${s.y},
              ${(s.x + d.x) / 2},${d.y},
              ${d.x},${d.y}`;
  }

  private click(d: any): void {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }
}
