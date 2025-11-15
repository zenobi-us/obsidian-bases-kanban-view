import React from 'react';
import { BasesEntry } from 'obsidian';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './Card.module.css';
import { useKanban } from '../context/KanbanContext';


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
export const Card = (props: {
  entry: BasesEntry;
  isDragOverlay?: boolean;
}): React.ReactElement => {
  const kanban = useKanban();
  const draggable = useDraggable({
    id: props.entry.file.path,
  });

  const style = {
    transform: CSS.Translate.toString(draggable.transform),
  };


  return (
    <div
      ref={draggable.setNodeRef}
      style={style}
      className={`${styles.card} ${draggable.isDragging && !props.isDragOverlay ? styles.dragging : ''} ${props.isDragOverlay ? styles.dragOverlay : ''}`}
      {...draggable.listeners}
      {...draggable.attributes}
      data-entry-path={props.entry.file.path}
    >
      <div className={styles.content}>
        <pre>
          {props.entry.file.path}
          {JSON.stringify(kanban.fields, null, 2)}
        </pre>
        {kanban.fields.map((field) => {
          const value = props.entry.getValue(field);
          return (
            <div key={field} className={styles.field} data-field-key={field}>
              <strong>{field}:</strong> {String(value)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
