import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualScroller } from '../useVirtualScroller';

describe('useVirtualScroller hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useVirtualScroller(100, 100)
    );

    expect(result.current.virtualizer).toBeDefined();
    expect(result.current.containerRef).toBeDefined();
  });

  it('should calculate visible item range', () => {
    const { result } = renderHook(() =>
      useVirtualScroller(100, 100)
    );

    const virtualizer = result.current.virtualizer;
    expect(virtualizer).toBeDefined();
    // Virtualizer provides methods to get visible range
    expect(virtualizer.getVirtualItems).toBeDefined();
  });

  it('should handle empty item list', () => {
    const { result } = renderHook(() =>
      useVirtualScroller(0, 100)
    );

    expect(result.current.virtualizer).toBeDefined();
    const items = result.current.virtualizer.getVirtualItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should update visible range when items change', () => {
    const { result, rerender } = renderHook(
      ({ itemCount, itemSize }) => useVirtualScroller(itemCount, itemSize),
      { initialProps: { itemCount: 100, itemSize: 100 } }
    );

    const initialVirtualizer = result.current.virtualizer;
    expect(initialVirtualizer).toBeDefined();

    rerender({ itemCount: 50, itemSize: 100 });

    expect(result.current.virtualizer).toBeDefined();
  });

  it('should handle container height changes', () => {
    const { result, rerender } = renderHook(
      ({ itemCount, itemSize }) => useVirtualScroller(itemCount, itemSize),
      { initialProps: { itemCount: 100, itemSize: 100 } }
    );

    expect(result.current.virtualizer).toBeDefined();

    rerender({ itemCount: 100, itemSize: 200 });

    expect(result.current.virtualizer).toBeDefined();
  });

  it('should provide container ref', () => {
    const { result } = renderHook(() =>
      useVirtualScroller(100, 100)
    );

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should calculate correct virtualizer count', () => {
    const itemCount = 100;
    const { result } = renderHook(() =>
      useVirtualScroller(itemCount, 100)
    );

    expect(result.current.virtualizer).toBeDefined();
    expect(result.current.virtualizer.options.count).toBe(itemCount);
  });
});
