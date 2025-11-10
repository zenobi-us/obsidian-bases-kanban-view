import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Obsidian API globally
(global as any).Obsidian = {
  App: vi.fn(),
};

// Mock console to reduce noise in tests
(global as any).console = {
  ...console,
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
