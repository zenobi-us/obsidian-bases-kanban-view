import { BasesEntry, BasesPropertyId } from 'obsidian';

/**
 * Card component props
 */
export interface CardProps {
  entry: BasesEntry;
  allProperties: BasesPropertyId[];
  onCardDrop: (cardId: string, targetGroupId: string) => Promise<void>;
}

/**
 * Card component renders a single kanban card
 * Placeholder for full implementation in story 4.5.4
 * 
 * @param props - CardProps with entry, allProperties, and onCardDrop handler
 * @returns React element rendering the card
 */
export const Card = ({
  entry,
  allProperties,
  onCardDrop
}: CardProps): React.ReactElement => {
  /**
   * Handle drag start event
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', entry.file.path);
  };

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
      data-entry-path={entry.file.path}
    >
      <div className="kanban-card-content">
        {/* Card rendering will be implemented in story 4.5.4 */}
        <p>Card: {entry.file.path}</p>
      </div>
    </div>
  );
};
