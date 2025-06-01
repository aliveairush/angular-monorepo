import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  input,
  InputSignal,
  NgZone,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreeNode {
  id: number;
  label: string;
  children?: TreeNode[];
}

export interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  label: string;
  width: number;
  children?: PositionedNode[];
}

@Component({
  selector: 'lib-angular-svg-tree',
  imports: [CommonModule],
  templateUrl: './angular-svg-tree.component.svg',
  styleUrl: './angular-svg-tree.component.css',
})
export class AngularSvgTreeComponent implements AfterViewInit {
  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  canvasWidth = input<number>(600);

  canvasHeight = input<number>(600);

  treeData: InputSignal<TreeNode> = input.required();

  levelSpacingY = input<number>(100); // по умолчанию 100px

  leafClick = output<PositionedNode>();

  viewBoxWidth = 1000;
  viewBoxHeight = 1000;

  readonly $$isPanning = signal(false);
  readonly $$startX = signal(0);
  readonly $$startY = signal(0);

  readonly $viewBox = computed(() => {
    return `${this.$$viewBoxX()} ${this.$$viewBoxY()} ${this.viewBoxWidth} ${
      this.viewBoxHeight
    }`;
  });

  svgContainer: Signal<ElementRef | undefined> =
    viewChild<ElementRef>('svgContainer');

  readonly $$flattenedTree = signal<ReadonlyArray<PositionedNode>>([]);

  readonly $$viewBoxX = signal(0);
  readonly $$viewBoxY = signal(0);

  readonly $visibleNodes: Signal<ReadonlyArray<PositionedNode>> = computed(() =>
    this.$$flattenedTree().filter(
      (node) =>
        node.x + 100 >= this.$$viewBoxX() &&
        node.x <= this.$$viewBoxX() + this.viewBoxWidth &&
        node.y + 40 >= this.$$viewBoxY() &&
        node.y <= this.$$viewBoxY() + this.viewBoxHeight
    )
  );

  readonly $visibleLinks = computed(() => {
    const all: { from: PositionedNode; to: PositionedNode }[] = [];

    const visibleIds = new Set(this.$visibleNodes().map((n) => n.id));

    for (const node of this.$$flattenedTree()) {
      if (!node.children) continue;

      for (const child of node.children) {
        // если хотя бы один из двух узлов видим — добавим линию
        if (visibleIds.has(node.id) || visibleIds.has(child.id)) {
          all.push({ from: node, to: child });
        }
      }
    }

    return all;
  });

  positionedTree: PositionedNode | null = null;

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
      this.$$viewBoxX() + (mouseX / svgRect.width) * this.viewBoxWidth;
    const viewBoxMouseY =
      this.$$viewBoxY() + (mouseY / svgRect.height) * this.viewBoxHeight;

    // Обновим размеры viewBox
    const newWidth = this.viewBoxWidth * scaleAmount;
    const newHeight = this.viewBoxHeight * scaleAmount;

    // Смещение, чтобы масштаб был вокруг курсора
    const dx = viewBoxMouseX - (mouseX / svgRect.width) * newWidth;
    const dy = viewBoxMouseY - (mouseY / svgRect.height) * newHeight;

    this.viewBoxWidth = newWidth;
    this.viewBoxHeight = newHeight;
    this.$$viewBoxX.set(dx);
    this.$$viewBoxY.set(dy);
    this.cdr.markForCheck();
  }

  onMouseDown(event: MouseEvent) {
    this.$$isPanning.set(true);
    this.$$startX.set(event.clientX);
    this.$$startY.set(event.clientY);
  }

  onMouseUp() {
    this.$$isPanning.set(false);
  }

  layoutTree(
    node: TreeNode,
    depth = 0,
    positioned: PositionedNode[] = [],
    xTracker = { current: 0 },
    spacing = 120
  ): PositionedNode {
    console.log('Tree rerender');

    const charWidth = 7.5;
    const paddingX = 20;
    const width = node.label.length * charWidth + paddingX;

    const positionedNode: PositionedNode = {
      id: node.id,
      label: node.label,
      x: 0,
      y: depth * this.levelSpacingY(),
      width,
    };

    if (!node.children || node.children.length === 0) {
      positionedNode.x = xTracker.current + width / 2;
      xTracker.current += width + spacing;
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
    if (this.$$isPanning()) {
      const dx = this.$$startX() - event.clientX;
      const dy = this.$$startY() - event.clientY;

      this.$$viewBoxX.set(this.$$viewBoxX() + dx);
      this.$$viewBoxY.set(this.$$viewBoxY() + dy);

      this.$$startX.set(event.clientX);
      this.$$startY.set(event.clientY);
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    this.positionedTree = this.layoutTree(this.treeData());

    this.$$flattenedTree.set(this.flatten(this.positionedTree));

    this.ngZone.runOutsideAngular(() => {
      console.log('svgContainer', this.svgContainer);
      const svg = this.svgContainer()?.nativeElement;
      if (!svg) return;

      svg.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown(e));
      svg.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e));
      svg.addEventListener('mouseup', () => this.onMouseUp());
      svg.addEventListener('wheel', (e: WheelEvent) => this.onZoom(e), {
        passive: false,
      });
    });
  }

  handleLeafClick(node: PositionedNode) {
    this.leafClick.emit(node);
  }

  ngDoCheck() {
    console.log('%c[CD] Change detection cycle', 'color: purple');
  }
}
