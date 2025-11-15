import React, { useState, useMemo } from 'react';
import { KanbanGroup, KanbanBoardProps } from '../types/components';
import { Column } from './Column';

/**
 * KanbanBoard component renders the main kanban board layout.
 * Groups entries by the specified property and renders columns.
 * 
 * @param props - KanbanBoardProps containing queryResult, groupByPropertyId, and allProperties
 * @returns React element rendering the kanban board
 */
export const KanbanBoard = ({
  queryResult,
  groupByPropertyId,
  allProperties
}: KanbanBoardProps): React.ReactElement => {
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  /**
   * Convert Obsidian groupedData to KanbanGroup array
   */
  const groups = useMemo((): KanbanGroup[] => {
    if (!queryResult || !queryResult.groupedData || queryResult.groupedData.length === 0) {
      return [];
    }

    // Convert grouped data to KanbanGroup objects
    const result: KanbanGroup[] = queryResult.groupedData.map((group) => ({
      id: group.key === null || group.key === undefined ? 'Backlog' : String(group.key),
      label: group.key === null || group.key === undefined ? 'Backlog' : String(group.key),
      entries: group.entries || []
    }));

    return result;
  }, [queryResult]);

  /**
   * Handle card drop onto a column
   */
  const handleCardDrop = async (cardId: string, targetGroupId: string): Promise<void> => {
    // Find source group from current groups
    const sourceGroup = groups.find((g) =>
      g.entries.some((entry) => entry.file.path === cardId)
    );
    const sourceGroupId = sourceGroup?.id || 'unknown';
    
    console.debug('[KanbanBoard] Card dropped:', { cardId, sourceGroupId, targetGroupId });
    // TODO: Implement property update in story 4.5.6
  };

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
          onCardDrop={handleCardDrop}
        />
      ))}
    </div>
  );
};
