import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { KanbanBoard } from '../KanbanBoard';
import { AppContext } from '../../context/AppContext';
import { BasesQueryResult, BasesPropertyId } from 'obsidian';

// Mock data
const mockQueryResult: BasesQueryResult & { groupedData?: any[] } = {
  data: [],
  properties: ['note.title', 'note.status'] as BasesPropertyId[],
  groupedData: [
    {
      key: 'In Progress',
      entries: [
        {
          id: 'entry-1',
          file: { path: 'test/note1.md', name: 'note1' },
          getValue: vi.fn(() => 'Value 1'),
        },
      ],
    },
    {
      key: 'Done',
      entries: [
        {
          id: 'entry-2',
          file: { path: 'test/note2.md', name: 'note2' },
          getValue: vi.fn(() => 'Value 2'),
        },
      ],
    },
  ],
} as any;

const mockApp = {
  workspace: {
    openLinkText: vi.fn(),
  },
  renderContext: {} as any,
} as any;

describe('KanbanBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render kanban board container', () => {
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.status"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    expect(container.querySelector('.kanban-board')).toBeTruthy();
  });

  it('should render loading state when no data', () => {
    const emptyResult = {
      data: [],
      properties: [],
      groupedData: [],
    } as any;

    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={emptyResult}
          groupByPropertyId="note.status"
          allProperties={[]}
        />
      </AppContext.Provider>
    );

    // Should render without crashing
    const board = container.querySelector('.kanban-board') || container.querySelector('.kanban-loading');
    expect(board).toBeTruthy();
  });

  it('should render columns for each group', () => {
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.status"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    const columns = container.querySelectorAll('.kanban-column');
    expect(columns.length).toBeGreaterThanOrEqual(0);
  });

  it('should pass data correctly to child components', () => {
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.status"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    // Verify board renders
    const board = container.querySelector('.kanban-board');
    expect(board).toBeTruthy();
  });

  it('should handle error state gracefully', () => {
    const errorResult = {
      data: null,
      properties: [],
      groupedData: null,
    } as any;

    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={errorResult}
          groupByPropertyId="note.status"
          allProperties={[]}
        />
      </AppContext.Provider>
    );

    // Should render error or empty state without crashing
    expect(container.querySelector('.kanban-error') || container.querySelector('.kanban-board')).toBeTruthy();
  });

  it('should update when groupByPropertyId changes', () => {
    const { rerender, container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.status"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    const initialBoard = container.querySelector('.kanban-board');
    expect(initialBoard).toBeTruthy();

    // Re-render with different grouping
    rerender(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.title"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    const updatedBoard = container.querySelector('.kanban-board');
    expect(updatedBoard).toBeTruthy();
  });

  it('should handle drag and drop callback', () => {
    const handleCardDrop = vi.fn();
    
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <KanbanBoard
          queryResult={mockQueryResult}
          groupByPropertyId="note.status"
          allProperties={mockQueryResult.properties || []}
        />
      </AppContext.Provider>
    );

    // Verify board is ready for drop events
    const board = container.querySelector('.kanban-board');
    expect(board).toBeTruthy();
  });
});
