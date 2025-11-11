import React from 'react';
import { BasesEntry, BasesPropertyId } from 'obsidian';
import {
  getTier1Properties,
  getTier2Properties,
  getTier3Properties,
  renderFieldValue,
  extractPropertyName
} from '../utils/fieldRenderers';

/**
 * Card component props
 */
export interface CardProps {
  entry: BasesEntry;
  allProperties: BasesPropertyId[];
  onCardDrop: (cardId: string, targetGroupId: string) => Promise<void>;
}

/**
 * Card component renders a single kanban card with tiered field rendering
 * 
 * Tier 1: Critical fields (title, status, priority, assignee, due date)
 * Tier 2: Important context (effort, progress, description)
 * Tier 3: Additional details (tags, custom fields, timestamps)
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
   * Handle drag start event - set card path as drag data
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', entry.file.path);
    
    // Add visual feedback
    (e.currentTarget as HTMLDivElement).classList.add('kanban-card--dragging');
    console.debug('[Card] Drag started', { cardId: entry.file.path });
  };

  /**
   * Handle drag end event - remove visual feedback
   */
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    (e.currentTarget as HTMLDivElement).classList.remove('kanban-card--dragging');
    console.debug('[Card] Drag ended', { cardId: entry.file.path });
  };

  /**
   * Render a single field with its value
   */
  const renderField = (propertyId: BasesPropertyId): React.ReactElement | null => {
    try {
      const value = entry.getValue(propertyId);
      if (value === null || value === undefined) {
        return null;
      }

      const propName = extractPropertyName(propertyId);
      const fieldValue = renderFieldValue(value);

      return (
        <div key={String(propertyId)} className="kanban-card-field">
          <span className="kanban-field-label">{propName}:</span>
          <span className="kanban-field-value">{fieldValue}</span>
        </div>
      );
    } catch (error) {
      console.warn(`[Card] Error rendering field ${propertyId}:`, error);
      return null;
    }
  };

  // Get properties for each tier
  const tier1Props = getTier1Properties(allProperties);
  const tier2Props = getTier2Properties(allProperties);
  const tier3Props = getTier3Properties(allProperties);

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-entry-path={entry.file.path}
    >
      <div className="kanban-card-content">
        {/* Tier 1: Critical fields */}
        {tier1Props.length > 0 && (
          <div className="kanban-card-tier-1">
            {tier1Props.map((propId) => renderField(propId))}
          </div>
        )}

        {/* Tier 2: Important context */}
        {tier2Props.length > 0 && (
          <div className="kanban-card-tier-2">
            {tier2Props.map((propId) => renderField(propId))}
          </div>
        )}

        {/* Tier 3: Additional details */}
        {tier3Props.length > 0 && (
          <div className="kanban-card-tier-3">
            {tier3Props.map((propId) => renderField(propId))}
          </div>
        )}
      </div>
    </div>
  );
};
