import React from "react";
import { KanbanGroup } from "../types/components";
import { BasesPropertyId } from "obsidian";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "./Card";
import styles from "./Column.module.css";

/**
 * Column component represents a single column in the kanban board
 */
export interface ColumnProps {
  group: KanbanGroup;
  allProperties: BasesPropertyId[];
}

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
export const Column = ({
  group,
  allProperties,
}: ColumnProps): React.ReactElement => {
  const droppable = useDroppable({
    id: group.id,
  });

  return (
    <div
      ref={droppable.setNodeRef}
      className={`${styles.column} ${droppable.isOver ? styles.dropTarget : ""}`}
      data-column-id={group.id}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{group.label}</h3>
        <span className={styles.count}>{group.entries.length}</span>
      </div>

      <div className={styles.cardsContainer}>
        {group.entries.map((entry) => (
          <Card
            key={entry.file.path}
            entry={entry}
            allProperties={allProperties}
          />
        ))}
      </div>
    </div>
  );
};
