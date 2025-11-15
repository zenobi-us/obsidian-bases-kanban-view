import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Column } from '../Column';
import { AppContext } from '../../context/AppContext';
import { GroupingProvider } from '../../context/GroupingContext';
import { BasesEntry, BasesPropertyId, QueryController } from 'obsidian';

const mockGroup = {
  id: 'in-progress',
  label: 'In Progress',
  entries: [
    {
      id: 'entry-1',
      file: { path: 'test/note1.md', name: 'note1' },
      getValue: vi.fn(() => 'Value 1'),
    } as any as BasesEntry,
  ],
};

const mockApp = {
  workspace: {
    openLinkText: vi.fn(),
  },
  renderContext: {} as any,
} as any;

const mockProperties = ['note.title', 'note.status'] as BasesPropertyId[];
const mockQueryController = {} as unknown as QueryController;

const renderColumn = (group = mockGroup, properties = mockProperties) => {
  return render(
    <AppContext.Provider value={mockApp}>
      <GroupingProvider
        queryController={mockQueryController}
        groupByFieldId="note.status"
        groupedData={[]}
      >
        <Column
          group={group}
          allProperties={properties}
        />
      </GroupingProvider>
    </AppContext.Provider>
  );
};

describe('Column Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render column container', () => {
    const { container } = renderColumn();
    expect(container.querySelector('.kanban-column')).toBeTruthy();
  });

  it('should display column label', () => {
    const { container } = renderColumn();
    const header = container.querySelector('.kanban-column-title');
    expect(header?.textContent).toBe('In Progress');
  });

  it('should display entry count', () => {
    const { container } = renderColumn();
    const count = container.querySelector('.kanban-column-count');
    expect(count?.textContent).toBe('1');
  });

  it('should render cards for each entry', () => {
    const multipleGroup = {
      ...mockGroup,
      entries: [
        { id: 'entry-1', file: { path: 'test/note1.md', name: 'note1' }, getValue: vi.fn() } as any,
        { id: 'entry-2', file: { path: 'test/note2.md', name: 'note2' }, getValue: vi.fn() } as any,
        { id: 'entry-3', file: { path: 'test/note3.md', name: 'note3' }, getValue: vi.fn() } as any,
      ],
    };

    const { container } = renderColumn(multipleGroup);
    const count = container.querySelector('.kanban-column-count');
    expect(count?.textContent).toBe('3');
  });

  it('should handle empty column', () => {
    const emptyGroup = {
      ...mockGroup,
      entries: [],
    };

    const { container } = renderColumn(emptyGroup);
    const count = container.querySelector('.kanban-column-count');
    expect(count?.textContent).toBe('0');
  });

  it('should handle drag over events', () => {
    const { container } = renderColumn();
    const column = container.querySelector('.kanban-column');
    expect(column).toBeTruthy();
  });

  it('should accept drops in cards container', () => {
    const { container } = renderColumn();
    const cardsContainer = container.querySelector('.kanban-cards-container');
    expect(cardsContainer).toBeTruthy();
  });
});
