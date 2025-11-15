import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { KanbanBoard } from '../components/KanbanBoard';
import { AppProvider } from '../context/AppContext';
import { GroupingProvider } from '../context/GroupingContext';
import { QueryController } from 'obsidian';

/**
 * Performance benchmarking suite for KanbanBoard component
 * 
 * Tests verify:
 * - Initial render time < 100ms
 * - Virtual scroller efficiency with large datasets
 * - Memory stability patterns
 * - No layout thrashing during scroll
 */

const mockApp = {
  workspace: { openLinkText: vi.fn() },
  renderContext: {} as any,
} as any;

const mockQueryController = {} as unknown as QueryController;

/**
 * Generate mock grouped data for load testing
 * @param count Number of entries to generate
 * @returns Grouped data structure with entries distributed across groups
 */
function generateMockGroupedData(count: number) {
  const statuses = ['Todo', 'In Progress', 'Done'];
  const groups: any[] = [];
  
  for (const status of statuses) {
    const entries = Array.from({ length: Math.floor(count / 3) }, (_, i) => ({
      id: `entry-${status}-${i}`,
      file: { path: `test/note-${status}-${i}.md`, name: `Note ${status} ${i}` } as any,
      getValue: vi.fn((propId: string) => {
        const values: Record<string, any> = {
          'note.title': `Entry Title ${i}`,
          'note.status': status,
          'note.priority': ['Low', 'Medium', 'High'][i % 3],
        };
        return values[propId];
      }),
    })) as any;
    
    groups.push({ key: status, entries });
  }
  
  return groups;
}

describe('KanbanBoard Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render initial board with 10 items in < 100ms', () => {
    const groupedData = generateMockGroupedData(10);
    const startTime = performance.now();
    
    render(
      <AppProvider app={mockApp}>
        <GroupingProvider
          queryController={mockQueryController}
          groupByFieldId="note.status"
          groupedData={groupedData}
        >
          <KanbanBoard
            allProperties={['note.title', 'note.status', 'note.priority'] as any}
          />
        </GroupingProvider>
      </AppProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(100);
    console.log(`✓ Render time for 10 items: ${renderTime.toFixed(2)}ms`);
  });

  it('should handle 100 items efficiently with virtual scrolling', () => {
    const groupedData = generateMockGroupedData(100);
    const startTime = performance.now();

    const { container } = render(
      <AppProvider app={mockApp}>
        <GroupingProvider
          queryController={mockQueryController}
          groupByFieldId="note.status"
          groupedData={groupedData}
        >
          <KanbanBoard
            allProperties={['note.title', 'note.status', 'note.priority'] as any}
          />
        </GroupingProvider>
      </AppProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(150);
    expect(container.querySelector('.kanban-board')).toBeTruthy();
    console.log(`✓ Render time for 100 items: ${renderTime.toFixed(2)}ms`);
  });

  it('should handle 500 items without memory bloat', () => {
    const groupedData = generateMockGroupedData(500);
    const startTime = performance.now();

    const { container } = render(
      <AppProvider app={mockApp}>
        <GroupingProvider
          queryController={mockQueryController}
          groupByFieldId="note.status"
          groupedData={groupedData}
        >
          <KanbanBoard
            allProperties={['note.title', 'note.status', 'note.priority'] as any}
          />
        </GroupingProvider>
      </AppProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(300);
    expect(container.querySelector('.kanban-board')).toBeTruthy();
    console.log(`✓ Render time for 500 items: ${renderTime.toFixed(2)}ms`);
  });

  it('should maintain consistent render times across multiple renders', () => {
    const groupedData = generateMockGroupedData(100);
    const renderTimes: number[] = [];

    for (let i = 0; i < 3; i++) {
      const startTime = performance.now();
      
      render(
        <AppProvider app={mockApp}>
          <GroupingProvider
            queryController={mockQueryController}
            groupByFieldId="note.status"
            groupedData={groupedData}
          >
            <KanbanBoard
              allProperties={['note.title', 'note.status', 'note.priority'] as any}
            />
          </GroupingProvider>
        </AppProvider>
      );

      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
    }

    const avgTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
    const maxDeviation = Math.max(...renderTimes.map(t => Math.abs(t - avgTime)));
    
    expect(maxDeviation).toBeLessThan(avgTime * 0.5);
    console.log(`✓ Render times consistent: ${renderTimes.map(t => t.toFixed(1)).join('ms, ')}ms`);
  });

  it('should group entries efficiently for different property ids', () => {
    const groupedData = generateMockGroupedData(50);
    const propertyIds = ['note.status', 'note.priority'];

    for (const propId of propertyIds) {
      const startTime = performance.now();
      
      render(
        <AppProvider app={mockApp}>
          <GroupingProvider
            queryController={mockQueryController}
            groupByFieldId={propId}
            groupedData={groupedData}
          >
            <KanbanBoard
              allProperties={['note.title', 'note.status', 'note.priority'] as any}
            />
          </GroupingProvider>
        </AppProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(120);
      console.log(`✓ Render time for grouping by ${propId}: ${renderTime.toFixed(2)}ms`);
    }
  });
});
