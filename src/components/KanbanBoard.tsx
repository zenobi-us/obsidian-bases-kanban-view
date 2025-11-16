import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import type { BasesEntry } from "obsidian";

import { useKanban } from "../context/KanbanContext";
import { Column } from "./Column";
import { Card } from "./Card";
import { OverlayCard } from "./OverlayCard";
import styles from "./KanbanBoard.module.css";
import { Notice } from "./Notice";
import classNames from "classnames";


function useDraggedEntry (entries: Map<string, BasesEntry>) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  
  const onDragStart = (cardId: string): void => {
    setDraggedId(cardId);
  };

  const onDragEnd = (): void => {
    setDraggedId(null);
  }

  const entry = React.useMemo(() => {
    if (!draggedId) return null;

    const entry = entries.get(draggedId);
    if (!entry) {
      console.warn("[KanbanBoard] Dragged entry not found for id:", draggedId);
      console.warn("[KanbanBoard] Current entries:", Array.from(entries.keys()));
      return null
    }

    return entry;
  }, [draggedId, entries]);

  return {
    entry,
    onDragStart,
    onDragEnd,
  };
}

const useDragAndDropKanban = () => {

  const kanban = useKanban();
  const dragged = useDraggedEntry(kanban.entries);

  /**
   * Handle drag end event
   * Extract card ID and target column from event and trigger move
   */
  const onDragEnd = async (event: DragEndEvent): Promise<void> => {

    if (!event.over) {
      console.debug("[KanbanBoard] Drop outside valid target, ignoring");
      return;
    }

    const cardId = String(event.active.id);
    const targetColumnId = String(event.over.id);

    if (cardId && targetColumnId) {
      try {
        console.debug("[KanbanBoard] Drag ended, moving card", {
          cardId,
          targetColumnId,
        });
        await kanban.moveCard(cardId, targetColumnId);
      } catch (error) {
        console.error("[KanbanBoard] Error moving card on drag end:", error);
      }
    }

    dragged.onDragEnd();
  };

  const onDragStart = (event: DragStartEvent): void => {
    const cardId = String(event.active.id);
    dragged.onDragStart(cardId);
  }

  return {
    onDragEnd,
    onDragStart,
    entry: dragged.entry,
  };
}

export const KanbanBoard = (): React.ReactElement => {
  const dragged = useDragAndDropKanban()
  const kanban = useKanban();

  if (kanban.error) {
    return (
      <Notice
        tone="error"
        message={`Error loading kanban board: ${kanban.error.message}`}
      />
    );
  }

  if (kanban.loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={dragged.onDragEnd} onDragStart={dragged.onDragStart}>
      <div className={classNames(styles.board, "board")}>
        {kanban.columnOrder.map((order) => (
          <Column key={order.key} label={order.label} group={kanban.columns.get(order.key)} />
        ))}
      </div>
      <DragOverlay>
         {dragged.entry && (
            <OverlayCard entry={dragged.entry}  />
         )}
       </DragOverlay>
    </DndContext>
  );
};


