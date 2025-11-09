interface VirtualScrollerConfig<T> {
  container: HTMLElement;
  items: T[];
  itemHeight?: number;
  overscan?: number;
  renderItem: (item: T) => HTMLElement;
  getItemKey: (item: T) => string;
}

export class VirtualScroller<T> {
  private container: HTMLElement;
  private items: T[];
  private itemHeight: number = 120; // Default estimate
  private overscan: number = 3;
  private renderItem: (item: T) => HTMLElement;
  private getItemKey: (item: T) => string;
  private visibleElements: Map<string, HTMLElement> = new Map();
  private scrollHandler: (() => void) | null = null;

  constructor(config: VirtualScrollerConfig<T>) {
    this.container = config.container;
    this.items = config.items;
    this.itemHeight = config.itemHeight || 120;
    this.overscan = config.overscan || 3;
    this.renderItem = config.renderItem;
    this.getItemKey = config.getItemKey;

    this.setupContainer();
    this.render();
    this.attachScrollListener();
  }

  private setupContainer(): void {
    this.container.style.overflow = 'auto';
    this.container.style.position = 'relative';
    this.container.style.height = '100%';
  }

  private attachScrollListener(): void {
    this.scrollHandler = () => this.render();
    this.container.addEventListener('scroll', this.scrollHandler);
  }

  private render(): void {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.overscan
    );

    const newVisibleElements = new Map<string, HTMLElement>();

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.items[i];
      const key = this.getItemKey(item);

      let element = this.visibleElements.get(key);
      if (!element) {
        element = this.renderItem(item);
        element.style.position = 'absolute';
        element.style.top = `${i * this.itemHeight}px`;
        element.style.left = '0';
        element.style.right = '0';
        element.style.width = '100%';
        this.container.appendChild(element);
      } else {
        element.style.top = `${i * this.itemHeight}px`;
      }

      newVisibleElements.set(key, element);
    }

    // Remove elements that are no longer visible
    for (const [key, element] of this.visibleElements.entries()) {
      if (!newVisibleElements.has(key)) {
        element.remove();
      }
    }

    this.visibleElements = newVisibleElements;

    // Set container content height for proper scrollbar sizing
    this.container.style.minHeight = `${this.items.length * this.itemHeight}px`;
  }

  destroy(): void {
    if (this.scrollHandler) {
      this.container.removeEventListener('scroll', this.scrollHandler);
    }
    // Remove all visible elements
    for (const element of this.visibleElements.values()) {
      element.remove();
    }
    this.visibleElements.clear();
  }
}
