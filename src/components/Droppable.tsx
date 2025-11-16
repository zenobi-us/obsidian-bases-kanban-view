import {useDroppable} from '@dnd-kit/core';
import { PropsWithChildren } from 'react';
import styles from "./Droppable.module.css";
import classNames from 'classnames';


export function Droppable(props: PropsWithChildren<{id: string, className?: string}>) {
  const droppable = useDroppable({
    id: props.id,
  });
  
  return (
    <div
      ref={droppable.setNodeRef}
      data-droppable-id={props.id}
      className={classNames(
        styles.droppable,
        'droppable',
        droppable.isOver ? styles['droppable--is-over'] : "",
        droppable.isOver ? "column--is-over" : "",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}