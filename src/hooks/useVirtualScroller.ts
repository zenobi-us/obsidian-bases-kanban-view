import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Virtual scroller hook result
 */
export interface UseVirtualScrollerResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  virtualizer: any;
}

/**
 * useVirtualScroller hook provides efficient virtualized rendering for large lists
 * 
 * Uses TanStack/Virtual to only render visible items in the viewport.
 * Dramatically improves performance for 100+ items per column.
 * 
 * @param itemCount - Total number of items to virtualize
 * @param itemSize - Height of each item in pixels (can be estimated)
 * @param options - Additional virtualizer options
 * @returns Object with containerRef and virtualizer instance
 */
export const useVirtualScroller = (
  itemCount: number,
  itemSize = 100,
  options?: {
    overscan?: number;
    gap?: number;
  }
): UseVirtualScrollerResult => {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize virtualizer with TanStack/Virtual
   */
  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemSize,
    overscan: options?.overscan || 10,
    gap: options?.gap || 0,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => (element as HTMLDivElement)?.getBoundingClientRect().height
        : undefined
  });

  return {
    containerRef,
    virtualizer
  };
};

/**
 * Hook to manage scroll position persistence
 */
export const useScrollPositionMemory = (
  columnId: string,
  scrollElement: HTMLDivElement | null
): void => {
  const scrollPositions = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!scrollElement) return;

    // Restore scroll position when scrollElement is ready
    const savedPosition = scrollPositions.current.get(columnId);
    if (savedPosition !== undefined) {
      scrollElement.scrollTop = savedPosition;
    }

    // Save scroll position on scroll
    const handleScroll = (): void => {
      scrollPositions.current.set(columnId, scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll);

    return (): void => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [columnId, scrollElement]);
};

/**
 * Hook to measure container height for virtual scrolling
 */
export const useContainerHeight = (
  containerRef: React.RefObject<HTMLDivElement>
): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = (): void => {
      if (containerRef.current) {
        setHeight(containerRef.current.clientHeight);
      }
    };

    // Initial measurement
    updateHeight();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);

    return (): void => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return height;
};
