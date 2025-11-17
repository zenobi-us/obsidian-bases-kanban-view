import React, { useMemo } from 'react';
import { BasesEntry } from 'obsidian';
import styles from './Card.module.css';
import { useKanban } from '../context/KanbanContext';
import classNames from 'classnames';


/**
 * Card component renders a single kanban card with tiered field rendering
 * 
 * Uses dndkit's useDraggable hook for drag functionality.
 * Components are pure rendering with dndkit handling all drag logic.
 * 
 * @param props - CardProps with entry and allProperties
 * @returns React element rendering the card
 */
export const Card = (props: {
  entry: BasesEntry;
  className?: string;
}): React.ReactElement => {
  const properties = useCardProperties(props.entry);

  return (
    <div
      className={classNames(
        styles.card,
        'card',
        styles.kind,
        'card--kind',
        styles[`kind-${properties.type || 'unknown'}`],
        `card--kind-${properties.type || 'unknown'}`,
        props.className
      )}
      data-entry-path={props.entry.file.path}
      data-kind={properties.type}
    >
      <div className={classNames(
        styles.content,
        'card--content'
      )}>
        <div className={classNames(styles.header, 'card--header')}>
          <div className={classNames(styles.kindAvatar, 'card--kind-avatar')}>{properties.type?.substring(0, 1) ?? '?'}</div>
          <div className={classNames(styles.title, 'card--title')}>{properties.title}</div>
        </div>

        <div className={classNames(styles.tags, 'card--tags')}>
          {properties.tags?.map((tag) => (
            <span key={tag.trim()} className={classNames(styles.tag, 'card--tag')}>
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
  tags?: string[];
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
      tags: String(entry.getValue(kanban.config.card.tagField) || '').split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter(tag => {
          try {
            JSON.parse(tag);
            return false;
          } catch {
            return true;
          }
        }),
      type: String(entry.getValue(kanban.config.card.typeField) || ''),
      storyPoints: Number(entry.getValue(kanban.config.card.storyPointsField) || 0),
      priority: String(entry.getValue(kanban.config.card.priorityField) || ''),
    };
  }, [entry]);

  return properties;

}
