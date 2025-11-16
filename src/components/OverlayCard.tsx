import React from 'react';
import { BasesEntry } from 'obsidian';
import classNames from 'classnames';
import styles from './Draggable.module.css';
import { Card } from './Card';


/**
 * OverlayCard - Visual-only card for DragOverlay
 * 
 * This component renders a card without any dnd-kit hooks.
 * It's used to display a ghost preview while dragging.
 * 
 * Why separate component?
 * - Cannot render same draggable ID twice with setNodeRef
 * - OverlayCard has no useDraggable, listeners, or attributes
 * - Avoids conflict with original Card's drag tracking
 * 
 * Positioning fix:
 * - By default, dnd-kit's DragOverlay centers the dragged element on the cursor
 * - This creates an offset where the overlay center is under the cursor, not the grab point
 * - Solution: Measure the card's dimensions and apply a negative translate
 * - This shifts the overlay so the top-left corner aligns closer to the cursor grab point
 * - The offset dynamically calculates based on card size to work across different themes/content
 */
export const OverlayCard = (props: {
  entry: BasesEntry;
}): React.ReactElement => {

  return (
    <Card 
      entry={props.entry}
      className={classNames(
        styles['draggable--overlay'],
        'card--drag-overlay'
      )}
    />
  );
};
