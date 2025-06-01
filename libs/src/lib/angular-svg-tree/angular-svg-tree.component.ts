import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
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
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

/**
 * This is representation of SVG based tree in Angular
 * Used Reingold–Tilford Tree Layout Algorithm to draw trees with balances appearance
 */
@Component({
  selector: 'lib-angular-svg-tree',
  imports: [CommonModule],
  templateUrl: './angular-svg-tree.component.svg',
  styleUrl: './angular-svg-tree.component.css',
})
export class AngularSvgTreeComponent implements AfterViewInit {
  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: DestroyRef
  ) {}

  canvasWidth = input<number>(600);

  canvasHeight = input<number>(600);

  treeData: InputSignal<TreeNode> = input.required();

  /**
   * Space between Parent and Child leaf - Y axis
   */
  levelSpacingY = input<number>(100);

  /**
   * Emit PositionedNode which contains x, y positions
   */
  leafClick = output<PositionedNode>();

  /**
   * get svg from template so we can add event listeners to it , like mousemove
   * Dont use (mousemove) in the template - so we dont trigger Change Detections
   */
  svgContainer: Signal<ElementRef | undefined> =
    viewChild<ElementRef>('svgContainer');

  /**
   * $$isPanning , Used to identify when we need to change canvas view on mousemove
   */
  readonly $$isPanning = signal(false);
  readonly $$mouseStartX = signal(0);
  readonly $$mouseStartY = signal(0);

  readonly $viewBox = computed(() => {
    return `${this.$$viewBoxX()} ${this.$$viewBoxY()} ${this.$$viewBoxWidth()} ${this.$$viewBoxHeight()}`;
  });

  /**
   * $$flattenedTree - is one dimensional array of initial tree.
   */
  readonly $$flattenedTree = signal<ReadonlyArray<PositionedNode>>([]);

  readonly $$viewBoxX = signal(0);
  readonly $$viewBoxY = signal(0);
  readonly $$viewBoxWidth = signal(1000);
  readonly $$viewBoxHeight = signal(1000);

  readonly $visibleNodes: Signal<ReadonlyArray<PositionedNode>> = computed(() =>
    this.$$flattenedTree().filter(
      (node) =>
        node.x + 100 >= this.$$viewBoxX() &&
        node.x <= this.$$viewBoxX() + this.$$viewBoxWidth() &&
        node.y + 40 >= this.$$viewBoxY() &&
        node.y <= this.$$viewBoxY() + this.$$viewBoxHeight()
    )
  );

  /**
   * tree with coordiates
   */
  readonly $$positionedTree = signal<PositionedNode | null>(null);

  /**
   * Visible links between nodes. We need to show the line contained in viewBox.
   * Recalculation when visible nodes are changed.
   */
  readonly $visibleLinks = computed(() => {
    const allVisibleNodesConnections: Array<{
      from: PositionedNode;
      to: PositionedNode;
    }> = [];

    const visibleNodeIds = new Set(this.$visibleNodes().map((n) => n.id));

    // Run for every node
    for (const node of this.$$flattenedTree()) {
      // node has no children skip
      if (!node.children) continue;

      // Run for every child node
      for (const child of node.children) {
        // if visible nodes has child or parent , we push new line;
        if (visibleNodeIds.has(node.id) || visibleNodeIds.has(child.id)) {
          allVisibleNodesConnections.push({ from: node, to: child });
        }
      }
    }
    return allVisibleNodesConnections;
  });

  onZoom(event: WheelEvent) {
    // Disable page scroll
    event.preventDefault();

    const svg = this.svgContainer(); // Signal<SVGElement>
    if (!svg) return;

    // Get getBoundingClientRect() for getting coordinates
    const svgRect = svg?.nativeElement.getBoundingClientRect();

    // getting mouse x coordinates in SVG, it is screen pixels
    const xMouseInPixelsInSvg = event.clientX - svgRect.left;
    const yMouseInPixelsInSvg = event.clientY - svgRect.top;

    // Svg width in pixels
    const svgWidthInPixels = svgRect.width;
    const svgHeightInPixels = svgRect.height;
    /**
     * example:
     * xMouseInPixels = 400px ,
     * svgWidth = 800
     * 400 / 800 = 0.5 so mouse is in middle
     */
    const howFarMouseXFromSvgPercentage =
      xMouseInPixelsInSvg / svgWidthInPixels;
    const howFarMouseYFromSvgPercentage =
      yMouseInPixelsInSvg / svgHeightInPixels;

    const xMouseInSvgUnitsInsideViewBox =
      this.$$viewBoxX() + howFarMouseXFromSvgPercentage * this.$$viewBoxWidth();
    const yMouseInSvgUnitsInsideViewBox =
      this.$$viewBoxY() +
      howFarMouseYFromSvgPercentage * this.$$viewBoxHeight();

    const scaleAmount = event.deltaY > 0 ? 1.1 : 0.9;

    // Update viewBox width and height
    const newWidth = this.$$viewBoxWidth() * scaleAmount;
    const newHeight = this.$$viewBoxHeight() * scaleAmount;
    this.$$viewBoxWidth.set(newWidth);
    this.$$viewBoxHeight.set(newHeight);

    // Adjust the viewBox position so that the zoom happens centered at the cursor location, not in the middle of the screen
    const dx =
      xMouseInSvgUnitsInsideViewBox - howFarMouseXFromSvgPercentage * newWidth;
    const dy =
      yMouseInSvgUnitsInsideViewBox - howFarMouseYFromSvgPercentage * newHeight;

    this.$$viewBoxX.set(dx);
    this.$$viewBoxY.set(dy);
    this.cdr.markForCheck(); // Update
  }

  /**
   * Start painting when mouse is down and save positions
   */
  onMouseDown(event: MouseEvent) {
    this.$$isPanning.set(true);
    this.$$mouseStartX.set(event.clientX);
    this.$$mouseStartY.set(event.clientY);
  }

  /**
   * Stop painting when mouse is up
   */
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
    const charWidth = 7.5; // Assume charachter is 7.5 pixels. Can be converted to props
    const paddingX = 20; // Padding inside box. Can be converted to props
    const width = node.label.length * charWidth + paddingX;

    const positionedNode: PositionedNode = {
      id: node.id,
      label: node.label,
      x: 0,
      y: 20 + depth * this.levelSpacingY(), // 20 is just a padding for root leaf. Can be converted to props
      width,
    };

    // if node has no children centers the box around the current position
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

  /**
   * flatten a tree into a flat array
   */
  private flatten(root: PositionedNode | null): PositionedNode[] {
    const result: PositionedNode[] = [];
    if (!root) return result;

    this.traverseTree(root, result);

    return result;
  }

  /**
   * recursively visit each node
   */
  private traverseTree(node: PositionedNode, result: PositionedNode[]): void {
    result.push(node);

    for (const child of node.children ?? []) {
      this.traverseTree(child, result);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.$$isPanning()) {
      const dx = this.$$mouseStartX() - event.clientX;
      const dy = this.$$mouseStartY() - event.clientY;

      this.$$viewBoxX.set(this.$$viewBoxX() + dx);
      this.$$viewBoxY.set(this.$$viewBoxY() + dy);

      this.$$mouseStartX.set(event.clientX);
      this.$$mouseStartY.set(event.clientY);
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    this.$$positionedTree.set(this.layoutTree(this.treeData()));

    this.$$flattenedTree.set(this.flatten(this.$$positionedTree()));

    /**
     * Calculations does not need to trigger cdr
     */
    this.ngZone.runOutsideAngular(() => {
      const svg = this.svgContainer()?.nativeElement;
      if (!svg) return;

      fromEvent<MouseEvent>(svg, 'mousedown')
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe((e) => this.onMouseDown(e));

      fromEvent<MouseEvent>(svg, 'mousemove')
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe((e) => this.onMouseMove(e));

      fromEvent<MouseEvent>(svg, 'mouseup')
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe(() => this.onMouseUp());

      fromEvent<WheelEvent>(svg, 'wheel')
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe((e) => this.onZoom(e));
    });
  }

  /**
   * Send positioned node to parent component
   */
  handleLeafClick(node: PositionedNode) {
    this.leafClick.emit(node);
  }

  ngDoCheck() {
    console.log('%c[CD] Change detection cycle', 'color: purple');
  }
}
