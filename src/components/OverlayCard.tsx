import React, { useEffect, useRef } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState<string>('translate(-110px, -40px)');

  useEffect(() => {
    // Measure the card on first render to calculate proper offset
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      // Offset to move from center-based positioning to top-left-based positioning
      // We use approximately 1/3 of width/height to account for padding and standard grab point
      const offsetX = -(width / 2 - 20);  // Slight offset from top-left corner
      const offsetY = -(height / 2 - 15); // Slight offset from top edge
      setTransform(`translate(${offsetX}px, ${offsetY}px)`);
    }
  }, [props.entry]);

  const wrapperStyle: React.CSSProperties = {
    transform,
    pointerEvents: 'none',
  };

  return (
    <div ref={cardRef} style={wrapperStyle}>
      <Card 
        entry={props.entry}
        className={classNames(
          styles.dragOverlay,
          'card--drag-overlay'
        )}
      />
    </div>
  );
};
