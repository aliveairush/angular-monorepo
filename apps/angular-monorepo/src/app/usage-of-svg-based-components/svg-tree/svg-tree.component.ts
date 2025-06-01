import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed,
  ElementRef,
  NgZone, OnInit, signal,
  Signal,
  viewChild, WritableSignal
} from '@angular/core';
import { largeTree } from './large-tree.const'

interface TreeNode {
  id: number;
  label: string;
  children?: TreeNode[];
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  children?: PositionedNode[];
}


const smallTree = {
  id: 1,
  label: 'Node 1',
  children: [
    {
      id: 2,
      label: 'Node 2',
      children: [
        {
          id: 3,
          label: 'Node 3',
        },
        {
          id: 130,
          label: 'Node 130',
        },
      ],
    },
    {
      id: 257,
      label: 'Node 257',
      children: [
        {
          id: 258,
          label: 'Node 258',
          children: [
            {
              id: 259,
              label: 'Node 259',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'app-svg-tree',
  imports: [],
  templateUrl: './svg-tree.component.svg',
  styleUrl: './svg-tree.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgTreeComponent implements OnInit {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  treeData: TreeNode = largeTree;

  positionedTree: PositionedNode = this.layoutTree(this.treeData);

  // transform = 'translate(0, 0) scale(1)';
  transform = `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`;



  updateTransform() {
    this.transform = `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`;
    this.cdr.markForCheck();
  }

  get viewBox(): string {
    return `${this.viewBoxX()} ${this.viewBoxY()} ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }

  // onZoom(event: WheelEvent) {
  //   event.preventDefault();
  //   const delta = event.deltaY > 0 ? -0.1 : 0.1;
  //   this.scale = Math.min(Math.max(this.scale + delta, 0.2), 3);
  //   this.updateTransform();
  // }

  onZoom(event: WheelEvent) {
    event.preventDefault();

    const svg = this.svgContainer(); // Signal<SVGElement>
    if (!svg) return;

    const svgRect = svg?.nativeElement.getBoundingClientRect();

    // Координаты мыши относительно SVG
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    const scaleAmount = event.deltaY > 0 ? 1.1 : 0.9;

    // Позиция мыши в системе координат viewBox
    const viewBoxMouseX =
      this.viewBoxX() + (mouseX / svgRect.width) * this.viewBoxWidth;
    const viewBoxMouseY =
      this.viewBoxY() + (mouseY / svgRect.height) * this.viewBoxHeight;

    // Обновим размеры viewBox
    const newWidth = this.viewBoxWidth * scaleAmount;
    const newHeight = this.viewBoxHeight * scaleAmount;

    // Смещение, чтобы масштаб был вокруг курсора
    const dx = viewBoxMouseX - (mouseX / svgRect.width) * newWidth;
    const dy = viewBoxMouseY - (mouseY / svgRect.height) * newHeight;

    this.viewBoxWidth = newWidth;
    this.viewBoxHeight = newHeight;
    this.viewBoxX.set(dx);
    this.viewBoxY.set(dy);
    this.updateTransform();
  }

  onMouseDown(event: MouseEvent) {
    this.isPanning = true;
    this.startX = event.clientX - this.offsetX;
    this.startY = event.clientY - this.offsetY;
  }

  onMouseUp() {
    this.isPanning = false;
  }

  layoutTree(
    node: TreeNode,
    depth = 0,
    positioned: PositionedNode[] = [],
    xTracker = { current: 0 },
    spacing = 120
  ): PositionedNode {
    console.log('Tree rerender');
    const positionedNode: PositionedNode = {
      id: node.id,
      label: node.label,
      x: 0,
      y: depth * 100,
    };

    if (!node.children || node.children.length === 0) {
      positionedNode.x = xTracker.current;
      xTracker.current += spacing;
    } else {
      const children: PositionedNode[] = [];
      for (const child of node.children) {
        const posChild = this.layoutTree(
          child,
          depth + 1,
          positioned,
          xTracker,
          spacing
        );
        children.push(posChild);
      }

      const left = children[0].x;
      const right = children[children.length - 1].x;
      positionedNode.x = (left + right) / 2;

      positionedNode.children = children;
    }

    positioned.push(positionedNode);
    return positionedNode;
  }

  flatten(root: PositionedNode | undefined): PositionedNode[] {
    console.log('flatten');

    const result: PositionedNode[] = [];
    if (!root) return result;

    const visit = (node: PositionedNode) => {
      result.push(node);
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    visit(root);
    return result;
  }

  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      console.log('event x', event.x);
      this.offsetX = event.clientX - this.startX;
      this.offsetY = event.clientY - this.startY;
      this.viewBoxX.set(-this.offsetX);
      this.viewBoxY.set(-this.offsetY);
      this.updateTransform();
    }
  }

  svgContainer: Signal<ElementRef | undefined> =
    viewChild<ElementRef>('svgContainer');

  $$flattenedTree = signal<ReadonlyArray<PositionedNode>>([]);

  viewBoxX = signal(0);
  viewBoxY = signal(0);
  viewBoxWidth = 1000;
  viewBoxHeight = 1000;

  visibleNodes: Signal<ReadonlyArray<PositionedNode>> = computed(() =>
    this.$$flattenedTree().filter(
      node =>
        node.x + 100 >= this.viewBoxX() &&
        node.x <= this.viewBoxX() + this.viewBoxWidth &&
        node.y + 40 >= this.viewBoxY() &&
        node.y <= this.viewBoxY() + this.viewBoxHeight
    )
  );
  ngOnInit(): void {
    this.positionedTree = this.layoutTree(this.treeData);

    this.$$flattenedTree.set(this.flatten(this.positionedTree));

    this.ngZone.runOutsideAngular(() => {
      console.log('svgContainer', this.svgContainer);
      const svg = this.svgContainer()?.nativeElement;
      if (!svg) return;

      svg.addEventListener('mousedown', (e: any) => this.onMouseDown(e));
      svg.addEventListener('mousemove', (e: any) => this.onMouseMove(e));
      svg.addEventListener('mouseup', (e: any) => this.onMouseUp());
      svg.addEventListener('wheel', (e: any) => this.onZoom(e), {
        passive: false,
      });
    });
  }

  ngDoCheck() {
    console.log('%c[CD] Change detection cycle', 'color: purple');
  }

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}
}
