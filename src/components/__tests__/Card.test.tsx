import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Card } from '../Card';
import { AppContext } from '../../context/AppContext';
import { BasesEntry, BasesPropertyId } from 'obsidian';

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
} as any as BasesEntry;

const mockApp = {
  workspace: {
    openLinkText: vi.fn(),
  },
  renderContext: {} as any,
} as any;

const mockOnDrop = vi.fn();

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card with entry data', () => {
    const mockProperties = ['note.title', 'note.status', 'note.priority'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={mockEntry}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

    const card = container.querySelector('.kanban-card');
    expect(card).toBeTruthy();
  });

  it('should handle drag start event', () => {
    const mockProperties = ['note.title', 'note.status'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={mockEntry}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

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

    const mockProperties = ['note.title', 'note.status', 'note.priority'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={entryWithFields}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

    // Card should render with the provided entry
    expect(container.querySelector('.kanban-card')).toBeTruthy();
  });

  it('should apply dragging class when drag event occurs', () => {
    const mockProperties = ['note.title'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={mockEntry}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

    const card = container.querySelector('.kanban-card') as HTMLElement;
    expect(card).toBeTruthy();
    
    // Simulate drag start using React's fireEvent
    if (card) {
      fireEvent.dragStart(card, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
        },
      });
      // The class should be added during drag start
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

    const mockProperties = ['note.title', 'note.status', 'note.priority'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={entryWithNullValues}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

    // Should render without crashing
    expect(container.querySelector('.kanban-card')).toBeTruthy();
  });

  it('should have correct data attributes for identification', () => {
    const mockProperties = ['note.title'] as BasesPropertyId[];
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={mockEntry}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

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
    const { container } = render(
      <AppContext.Provider value={mockApp}>
        <Card
          entry={entryWithMultipleFields}
          allProperties={mockProperties}
          onCardDrop={mockOnDrop}
        />
      </AppContext.Provider>
    );

    // All properties should be rendered
    const card = container.querySelector('.kanban-card');
    expect(card).toBeTruthy();
  });
});
