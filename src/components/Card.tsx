import React, { useMemo } from 'react';
import { BasesEntry } from 'obsidian';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './Card.module.css';
import { useKanban } from '../context/KanbanContext';
import classNames from 'classnames';
import stringify from 'safe-stringify'


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

  const properties = useCardProperties(props.entry);

  return (
    <div
      ref={draggable.setNodeRef}
      style={style}
      className={classNames(
        styles.card,
        styles.kind,
        draggable.isDragging && !props.isDragOverlay ? styles.dragging : '',
        props.isDragOverlay ? styles.dragOverlay : '',
        styles[`kind-${properties.type || 'unknown'}`]
      )}
      {...draggable.listeners}
      {...draggable.attributes}
      data-entry-path={props.entry.file.path}
      data-kind={properties.type}
    >
      <div className={classNames(
        styles.content,
      )}>
        <div className={styles.header}>
          <div className={styles.kindAvatar}>{properties.type?.substring(0, 1) ?? '?'}</div>
          <div className={styles.title}>{properties.title}</div>
        </div>

        <div className={styles.tags}>
          {properties.tags?.split(',').map((tag) => (
            <span key={tag.trim()} className={styles.tag}>
              {tag.replace('#', '').trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


type CardUiFields = {
  title: string;
  tags?: string;
  type?: string;
  storyPoints?: number;
  priority?: string;
  kind?: string;
}

function useCardProperties(entry: BasesEntry) {
  const kanban = useKanban();
  const properties = useMemo((): CardUiFields => {
    return {
      title: String(entry.getValue(kanban.config.card.titleField) || 'Untitled'),
      tags: String(entry.getValue(kanban.config.card.tagField) || ''),
      type: String(entry.getValue(kanban.config.card.typeField) || ''),
      storyPoints: Number(entry.getValue(kanban.config.card.storyPointsField) || 0),
      priority: String(entry.getValue(kanban.config.card.priorityField) || ''),
    };
  }, [entry]);

  return properties;

}