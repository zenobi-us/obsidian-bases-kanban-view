import React from 'react';
import { BasesPropertyId } from 'obsidian';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { useGrouping } from '../context/GroupingContext';
import { Column } from './Column';
import { Card } from './Card';
import styles from './KanbanBoard.module.css';

/**
 * KanbanBoard component renders the main kanban board layout with dndkit support.
 * 
 * Architecture:
 * - DndContext wraps board to provide drag-drop system
 * - DragOverlay renders dragged card preview
 * - Column components use useDroppable to become drop targets
 * - Card components use useDraggable for drag capability
 * - On drop, moveCard handler updates Obsidian data
 * 
 * This is now a pure rendering component with no state management.
 * All data flows through context, ensuring automatic updates.
 * 
 * @param props - allProperties for rendering card fields
 * @returns React element rendering the kanban board with dndkit
 */
export interface KanbanBoardProps {
  allProperties: BasesPropertyId[];
}

export const KanbanBoard = ({
  allProperties
}: KanbanBoardProps): React.ReactElement => {
  const { groups, error, loading, moveCard } = useGrouping();

  /**
   * Handle drag end event
   * Extract card ID and target column from event and trigger move
   */
  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;

    if (!over) {
      console.debug('[KanbanBoard] Drop outside valid target, ignoring');
      return;
    }

    const cardId = String(active.id);
    const targetColumnId = String(over.id);

    if (cardId && targetColumnId) {
      try {
        console.debug('[KanbanBoard] Drag ended, moving card', { cardId, targetColumnId });
        await moveCard(cardId, targetColumnId);
      } catch (error) {
        console.error('[KanbanBoard] Error moving card on drag end:', error);
      }
    }
  };

  /**
   * Get dragged card for overlay preview
   */
  const getDraggedCard = (): React.ReactElement | null => {
    const draggedId = null; // Will be populated by useDndContext if needed
    if (!draggedId) return null;

    for (const group of groups) {
      const entry = group.entries.find(e => e.file.path === String(draggedId));
      if (entry) {
        return (
          <Card
            entry={entry}
            allProperties={allProperties}
          />
        );
      }
    }
    return null;
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p className={styles.errorMessage}>Error loading kanban board: {error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {groups.map((group) => (
          <Column
            key={group.id}
            group={group}
            allProperties={allProperties}
          />
        ))}
      </div>
      <DragOverlay>
        {getDraggedCard()}
      </DragOverlay>
    </DndContext>
  );
};
