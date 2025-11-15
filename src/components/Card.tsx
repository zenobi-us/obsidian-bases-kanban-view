import React from 'react';
import { BasesEntry, BasesPropertyId } from 'obsidian';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  isDragOverlay?: boolean;
}

/**
 * Card component renders a single kanban card with tiered field rendering
 * 
 * Tier 1: Critical fields (title, status, priority, assignee, due date)
 * Tier 2: Important context (effort, progress, description)
 * Tier 3: Additional details (tags, custom fields, timestamps)
 * 
 * Uses dndkit's useDraggable hook for drag functionality.
 * Components are pure rendering with dndkit handling all drag logic.
 * 
 * @param props - CardProps with entry and allProperties
 * @returns React element rendering the card
 */
export const Card = ({
  entry,
  allProperties,
  isDragOverlay = false
}: CardProps): React.ReactElement => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.file.path,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isDragOverlay ? 0.5 : 1,
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
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging && !isDragOverlay ? 'kanban-card--dragging' : ''}`}
      {...listeners}
      {...attributes}
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
