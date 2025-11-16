import React from 'react';
import { BasesEntry } from 'obsidian';
import classNames from 'classnames';
import styles from './Card.module.css';
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
 */
export const OverlayCard = (props: {
  entry: BasesEntry;
}): React.ReactElement => {
  return (
    <Card 
      entry={props.entry}
      className={classNames(
        styles.dragOverlay,
        'card--drag-overlay'
      )}
    />
  );
};
