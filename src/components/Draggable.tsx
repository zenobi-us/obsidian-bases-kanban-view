import { useDraggable } from "@dnd-kit/core";
import React, { PropsWithChildren } from "react";
import styles from "./Draggable.module.css";
import classNames from "classnames";

export function Draggable(props: PropsWithChildren<{ id: string; className?: string }>) {
  const draggable = useDraggable({
    id: props.id,
  });

  return (
    <div 
      ref={draggable.setNodeRef}
      className={classNames(
        styles.draggable,
        'draggable',
        draggable.isDragging ? styles['draggable--is-dragging'] : "",
        draggable.isDragging ? "card--is-dragging" : "",
        props.className
      )}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      {props.children}
    </div>
  );
}
