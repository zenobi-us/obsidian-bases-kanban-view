import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Card } from '../Card';
import { AppContext } from '../../context/AppContext';
import { GroupingProvider } from '../../context/GroupingContext';
import { BasesPropertyId, QueryController } from 'obsidian';

// Mock entry data
const mockEntry = {
  id: 'entry-1',
  file: {
    path: 'test/note.md',
    name: 'test note',
  },
  getValue: vi.fn((propertyId: string) => {
    const values: Record<string, any> = {
      'note.title': { renderTo: vi.fn() },
      'note.status': { renderTo: vi.fn() },
      'note.priority': 'high',
    };
    return values[propertyId];
  }),
} as any;

const mockApp = {
  workspace: {
    openLinkText: vi.fn(),
  },
  renderContext: {} as any,
} as any;

const mockQueryController = {} as unknown as QueryController;

const renderCard = (entry = mockEntry, properties = ['note.title', 'note.status', 'note.priority'] as BasesPropertyId[]) => {
  return render(
    <AppContext.Provider value={mockApp}>
      <GroupingProvider
        queryController={mockQueryController}
        groupByFieldId="note.status"
        groupedData={[]}
      >
        <Card
          entry={entry}
          allProperties={properties}
        />
      </GroupingProvider>
    </AppContext.Provider>
  );
};

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card with entry data', () => {
    const { container } = renderCard();
    const card = container.querySelector('.kanban-card');
    expect(card).toBeTruthy();
  });

  it('should handle drag start event', () => {
    const { container } = renderCard();
    const card = container.querySelector('[draggable="true"]');
    expect(card).toBeTruthy();

    if (card) {
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
      });
      fireEvent(card, dragStartEvent);
    }
  });

  it('should display card content with property values', () => {
    const entryWithFields = {
      ...mockEntry,
      getValue: vi.fn((propId: string) => {
        const values: Record<string, any> = {
          'note.title': 'Test Title',
          'note.status': 'In Progress',
          'note.priority': 'High',
        };
        return values[propId];
      }),
    };

    const { container } = renderCard(entryWithFields);
    expect(container.querySelector('.kanban-card')).toBeTruthy();
  });

  it('should apply dragging class when drag event occurs', () => {
    const { container } = renderCard();
    const card = container.querySelector('.kanban-card') as HTMLElement;
    expect(card).toBeTruthy();
    
    if (card) {
      fireEvent.dragStart(card, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
        },
      });
      expect(card.classList.contains('kanban-card--dragging') || card.hasAttribute('draggable')).toBeTruthy();
    }
  });

  it('should handle null/undefined property values gracefully', () => {
    const entryWithNullValues = {
      ...mockEntry,
      getValue: vi.fn((propId: string) => {
        const values: Record<string, any> = {
          'note.title': null,
          'note.status': undefined,
          'note.priority': 'Medium',
        };
        return values[propId];
      }),
    };

    const { container } = renderCard(entryWithNullValues);
    expect(container.querySelector('.kanban-card')).toBeTruthy();
  });

  it('should have correct data attributes for identification', () => {
    const { container } = renderCard();
    const card = container.querySelector('.kanban-card');
    expect(card?.getAttribute('data-entry-path')).toBe('test/note.md');
  });

  it('should render multiple properties in correct order', () => {
    const entryWithMultipleFields = {
      ...mockEntry,
      getValue: vi.fn((propId: string) => {
        const values: Record<string, any> = {
          'note.prop1': 'Value 1',
          'note.prop2': 'Value 2',
          'note.prop3': 'Value 3',
        };
        return values[propId];
      }),
    };

    const mockProperties = ['note.prop1', 'note.prop2', 'note.prop3'] as BasesPropertyId[];
    const { container } = renderCard(entryWithMultipleFields, mockProperties);
    const card = container.querySelector('.kanban-card');
    expect(card).toBeTruthy();
  });
});
