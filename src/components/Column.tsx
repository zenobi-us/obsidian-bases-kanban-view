import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "./Card";
import styles from "./Column.module.css";
import { KanbanGroup } from "../utils/KanbanStateController";


/**
 * Column renders a single kanban column with cards using dndkit
 *
 * Architecture:
 * - useDroppable makes column a valid drop target
 * - Group ID is used as the drop zone identifier
 * - Visual feedback handled by isOver state from dndkit
 * - Actual card movement handled by KanbanBoard's onDragEnd
 *
 * @param props - ColumnProps with group and allProperties
 * @returns React element rendering the column
 */
export const Column = (props: {
  label?: string;
  group?: KanbanGroup | undefined;
}): React.ReactElement => {
  const columnId = props.group?.key?.toString() || "Backlog";
  const columnName = props.label || props.group?.key?.toString() || "Backlog";
  const droppable = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={droppable.setNodeRef}
      className={`${styles.column} ${droppable.isOver ? styles.dropTarget : ""}`}
      data-column-id={columnId}
    >
      <div className={styles.header} data-testid="column-header">
        <h3 className={styles.title} data-testid="column-title">{columnName}</h3>
        <span className={styles.count} data-testid="column-count">{props.group?.entries.length}</span>
      </div>

      <div className={styles.cardsContainer} data-testid="cards-container">
        {props.group?.entries.map((entry) => (
          <Card
            key={entry.file.path}
            entry={entry}
          />
        ))}
      </div>
    </div>
  );
};
