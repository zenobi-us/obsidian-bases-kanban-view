import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "./Card";
import styles from "./Column.module.css";
import { KanbanGroup } from "../utils/KanbanStateController";
import { Draggable } from "./Draggable";
import classNames from "classnames";
import { Droppable } from "./Droppable";


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
  id: string;
  label: string;
  group?: KanbanGroup | undefined;
}): React.ReactElement => {
  const columnId = props.id
  const columnName = props.label

  return (
    <Droppable
      id={columnId}
      data-column-id={columnId}
      className={classNames(
        styles.column,
        "column",
      )}
    >
      <div className={classNames(styles.header, "column--header")} data-testid="column-header">
        <h3 className={classNames(styles.title, "column--title")} data-testid="column-title">{columnName}</h3>
        <span className={classNames(styles.count, "column--count")} data-testid="column-count">{props.group?.entries.length}</span>
      </div>

      <div className={classNames(styles.cardsContainer, "column--cards-container")} data-testid="cards-container">
        {props.group?.entries.map((entry) => (
          <Draggable key={entry.file.path} id={entry.file.path}>
            <Card
              entry={entry}
            />
          </Draggable>
        ))}
      </div>
    </Droppable>
  );
};
