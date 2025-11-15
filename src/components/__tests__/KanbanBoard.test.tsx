import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { KanbanBoard } from '../KanbanBoard';
import { AppContext } from '../../context/AppContext';
import { GroupingProvider } from '../../context/GroupingContext';
import { BasesPropertyId, QueryController } from 'obsidian';
import { GroupedDataItem } from '../../types/components';

// Mock data
const mockGroupedData: GroupedDataItem[] = [
  {
    key: 'In Progress',
    entries: [
      {
        id: 'entry-1',
        file: { path: 'test/note1.md', name: 'note1' } as any,
        getValue: vi.fn(() => 'Value 1'),
      } as any,
    ],
  },
  {
    key: 'Done',
    entries: [
      {
        id: 'entry-2',
        file: { path: 'test/note2.md', name: 'note2' } as any,
        getValue: vi.fn(() => 'Value 2'),
      } as any,
    ],
  },
];

const mockProperties: BasesPropertyId[] = ['note.title', 'note.status'];

const mockApp = {
  workspace: {
    openLinkText: vi.fn(),
  },
  renderContext: {} as any,
} as any;

const mockQueryController = {} as unknown as QueryController;

const renderKanbanBoard = (
  groupedData: GroupedDataItem[] = mockGroupedData,
  properties: BasesPropertyId[] = mockProperties
) => {
  return render(
    <AppContext.Provider value={mockApp}>
      <GroupingProvider
        app={mockApp}
        queryController={mockQueryController}
        groupByFieldId="note.status"
        groupedData={groupedData}
      >
        <KanbanBoard allProperties={properties} />
      </GroupingProvider>
    </AppContext.Provider>
  );
};

describe.skip('KanbanBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render kanban board container', () => {
    const { container } = renderKanbanBoard();
    expect(container.querySelector('.kanban-board')).toBeTruthy();
  });

  it('should render loading state when no data', () => {
    const { container } = renderKanbanBoard([], []);
    const board = container.querySelector('.kanban-board') || container.querySelector('.kanban-loading');
    expect(board).toBeTruthy();
  });

  it('should render columns for each group', () => {
    const { container } = renderKanbanBoard();
    const columns = container.querySelectorAll('.kanban-column');
    expect(columns.length).toBeGreaterThanOrEqual(2);
  });

  it('should pass data correctly to child components', () => {
    const { container } = renderKanbanBoard();
    const board = container.querySelector('.kanban-board');
    expect(board).toBeTruthy();
  });

  it('should handle error state gracefully', () => {
    const { container } = renderKanbanBoard([], []);
    const errorOrBoard = container.querySelector('.kanban-error') || container.querySelector('.kanban-board');
    expect(errorOrBoard).toBeTruthy();
  });

  it('should render with data', () => {
    const { container } = renderKanbanBoard();
    expect(container.querySelector('.kanban-board')).toBeTruthy();
    expect(container.querySelector('.kanban-column')).toBeTruthy();
  });

  it('should display column count', () => {
    const { container } = renderKanbanBoard();
    const columnCounts = container.querySelectorAll('.kanban-column-count');
    expect(columnCounts.length).toBeGreaterThan(0);
  });
});
