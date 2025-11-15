import React from 'react';
import { BasesPropertyId } from 'obsidian';
import { useGrouping } from '../context/GroupingContext';
import { Column } from './Column';

/**
 * KanbanBoard component renders the main kanban board layout.
 * Gets groups and handlers from GroupingContext, rendering pure columns.
 * 
 * This is now a pure rendering component with no state management.
 * All data flows through context, ensuring automatic updates.
 * 
 * @param props - allProperties for rendering card fields
 * @returns React element rendering the kanban board
 */
export interface KanbanBoardProps {
  allProperties: BasesPropertyId[];
}

export const KanbanBoard = ({
  allProperties
}: KanbanBoardProps): React.ReactElement => {
  const { groups, error, loading } = useGrouping();

  if (error) {
    return (
      <div className="kanban-error">
        <p>Error loading kanban board: {error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="kanban-loading">Loading...</div>;
  }

  return (
    <div className="kanban-board">
      {groups.map((group) => (
        <Column
          key={group.id}
          group={group}
          allProperties={allProperties}
        />
      ))}
    </div>
  );
};
