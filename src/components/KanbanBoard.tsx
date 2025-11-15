import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { useKanban } from "../context/KanbanContext";
import { Column } from "./Column";
import { Card } from "./Card";
import styles from "./KanbanBoard.module.css";
import { Notice } from "./Notice";


export const KanbanBoard = (): React.ReactElement => {
  const kanban = useKanban();

  /**
   * Handle drag end event
   * Extract card ID and target column from event and trigger move
   */
  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {

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
  };

  const handleDragStart = (event: DragStartEvent): void => {
    console.debug("[KanbanBoard] Drag started");

    const cardId = String(event.active.id);
    const sourceColumn = event.activatorEvent

    console.log("[KanbanBoard] Drag started:", { cardId, sourceColumn });

  }

  /**
   * Get dragged card for overlay preview
   */
  const getDraggedCard = (): React.ReactElement | null => {
    const draggedId = null; // Will be populated by useDndContext if needed
    if (!draggedId) return null;
    const entry = kanban.entries.get(draggedId);
    if (!entry) {
      console.warn("[KanbanBoard] Dragged entry not found for id:", draggedId);
      return null
    }

    return <Card entry={entry} />;
  };

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
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className={styles.board}>
        {kanban.columnOrder.map((order) => (
          <Column key={order.key} label={order.label} group={kanban.columns.get(order.key)}
          
          />
        ))}
      </div>
      <DragOverlay>{getDraggedCard()}</DragOverlay>
    </DndContext>
  );
};


