import { KanbanGroup } from '../types/components';
import { BasesPropertyId } from 'obsidian';
import { Card } from './Card';

/**
 * Column component represents a single column in the kanban board
 */
export interface ColumnProps {
  group: KanbanGroup;
  allProperties: BasesPropertyId[];
  onCardDrop: (cardId: string, targetGroupId: string) => Promise<void>;
}

/**
 * Column renders a single kanban column with cards
 * 
 * @param props - ColumnProps with group, allProperties, and onCardDrop handler
 * @returns React element rendering the column
 */
export const Column = ({
  group,
  allProperties,
  onCardDrop
}: ColumnProps): React.ReactElement => {
  /**
   * Handle drag over event - show drop target visual
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.add('kanban-column--drop-target');
  };

  /**
   * Handle drag leave event - remove drop target visual
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    if (e.currentTarget === e.target) {
      e.currentTarget.classList.remove('kanban-column--drop-target');
    }
  };

  /**
   * Handle drop event - trigger card move
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    e.currentTarget.classList.remove('kanban-column--drop-target');

    try {
      const cardId = e.dataTransfer.getData('cardId');
      if (cardId) {
        console.debug('[Column] Card dropped', { cardId, targetColumnId: group.id });
        await onCardDrop(cardId, group.id);
      }
    } catch (error) {
      console.error('[Column] Error handling drop:', error);
    }
  };

  return (
    <div
      className="kanban-column"
      data-column-id={group.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
            onCardDrop={onCardDrop}
          />
        ))}
      </div>
    </div>
  );
};
