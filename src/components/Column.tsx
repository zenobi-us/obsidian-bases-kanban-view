import React from 'react';
import { KanbanGroup } from '../types/components';
import { BasesPropertyId } from 'obsidian';
import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';

/**
 * Column component represents a single column in the kanban board
 */
export interface ColumnProps {
  group: KanbanGroup;
  allProperties: BasesPropertyId[];
}

/**
 * Column renders a single kanban column with cards using dndkit
 * 
 * Architecture:
 * - useDroppable makes column a valid drop target
 * - Group ID is used as the drop zone identifier
 * - Visual feedback handled by isOver state from dndkit
 * - Actual card movement handled by KanbanBoard's onDragEnd
 * 
 * @param props - ColumnProps with group and allProperties
 * @returns React element rendering the column
 */
export const Column = ({
  group,
  allProperties
}: ColumnProps): React.ReactElement => {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'kanban-column--drop-target' : ''}`}
      data-column-id={group.id}
    >
      <div className="kanban-column-header">
        <h3 className="kanban-column-title">{group.label}</h3>
        <span className="kanban-column-count">{group.entries.length}</span>
      </div>

      <div className="kanban-cards-container">
        {group.entries.map((entry) => (
          <Card
            key={entry.file.path}
            entry={entry}
            allProperties={allProperties}
          />
        ))}
      </div>
    </div>
  );
};
