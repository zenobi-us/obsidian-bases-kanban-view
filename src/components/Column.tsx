import React from "react";
import { Card } from "./Card";
import styles from "./Column.module.css";
import { KanbanGroup } from "../utils/KanbanStateController";
import { Draggable } from "./Draggable";
import classNames from "classnames";
import { Droppable } from "./Droppable";
import { FilterButtonField } from "./FilterButtonField";


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
      <div className={classNames(styles.header, "column_header")} data-testid="column-header">
        <div className={classNames(styles.title, "column_title")} data-testid="column-title">
          <span className={classNames(styles.count, "column_count")} data-testid="column-count">{props.group?.entries.length || 0}</span>
          <h3 className={classNames(styles.name, "column_name")} data-testid="column-name">{columnName}</h3>
        </div>
        <div className={classNames(styles.actions, "column_actions")} data-testid="column-actions">
          {/* filter button, reveals textbox */}
          {/* <FilterButtonField /> */}
        </div>
      </div>

      <div className={classNames(styles.cardsContainer, "column_cards-container")} data-testid="cards-container">
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


