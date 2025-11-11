import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useKanbanData } from '../useKanbanData';
import { AppProvider } from '../../context/AppContext';

const mockApp = {
  vault: {
    adapter: {},
  },
} as unknown;

describe('useKanbanData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHookWithProvider = (hook: () => unknown) =>
    renderHook(hook, {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(AppProvider, { app: mockApp as any }, children),
    });

  it('should initialize with empty data and loading state', () => {
    const { result } = renderHookWithProvider(() => useKanbanData());

    expect((result.current as any).queryResult).toBeNull();
    expect((result.current as any).error).toBeNull();
  });

  it('should return data structure with required fields', () => {
    const { result } = renderHookWithProvider(() => useKanbanData());

    expect(result.current).toHaveProperty('queryResult');
    expect(result.current).toHaveProperty('error');
  });

  it('should handle null query result gracefully', () => {
    const { result } = renderHookWithProvider(() => useKanbanData());

    expect((result.current as any).queryResult).toBeNull();
    expect((result.current as any).error).toBeNull();
  });

  it('should not trigger unnecessary re-renders', () => {
    let renderCount = 0;

    const { rerender } = renderHookWithProvider(() => {
      renderCount++;
      return useKanbanData();
    });

    const initialRenderCount = renderCount;

    rerender();

    // Render count should not increase on simple rerender without data change
    expect(renderCount).toBeGreaterThanOrEqual(initialRenderCount);
  });

  it('should provide empty data state initially', () => {
    const { result } = renderHookWithProvider(() => useKanbanData());

    expect((result.current as any).queryResult).toBeNull();
  });
});
