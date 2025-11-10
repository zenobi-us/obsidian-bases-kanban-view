import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApp } from '../../hooks/useApp';
import { AppContext } from '../../context/AppContext';

describe('useApp hook', () => {
  it('should return app from context', () => {
    const mockApp = { id: 'test-app' } as any;

    const wrapper = ({ children }: any) => (
      <AppContext.Provider value={mockApp}>{children}</AppContext.Provider>
    );

    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current).toBe(mockApp);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useApp());
    }).toThrow('useApp must be used within an AppProvider');
  });
});
