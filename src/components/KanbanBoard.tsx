import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin
} from "@dnd-kit/core";
import { snapCenterToCursor,  } from "@dnd-kit/modifiers";
import type { BasesEntry } from "obsidian";

import { useKanban } from "../context/KanbanContext";
import { Column } from "./Column";
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
   const onDragEnd = React.useCallback(async (event: DragEndEvent): Promise<void> => {
     console.debug("[KanbanBoard] onDragEnd event received", {
       activeId: event.active?.id,
       overId: event.over?.id,
       hasOver: !!event.over,
     });

     if (!event.over) {
       console.debug("[KanbanBoard] Drop outside valid target, ignoring");
       dragged.onDragEnd();
       return;
     }

     const cardId = String(event.active.id);
     const targetColumnId = String(event.over.id);

     console.debug("[KanbanBoard] Processing drag end", {
       cardId,
       targetColumnId,
       hasMoveCard: !!kanban.moveCard,
     });

     if (cardId && targetColumnId && kanban.moveCard) {
       try {
         console.debug("[KanbanBoard] Calling moveCard with", {
           cardId,
           targetColumnId,
         });
         await kanban.moveCard(cardId, targetColumnId);
         console.debug("[KanbanBoard] moveCard completed successfully");
       } catch (error) {
         console.error("[KanbanBoard] Error moving card on drag end:", error);
       }
     } else {
       console.warn("[KanbanBoard] Missing required parameters for moveCard", {
         cardId,
         targetColumnId,
         hasMoveCard: !!kanban.moveCard,
       });
     }

     dragged.onDragEnd();
   }, [kanban.moveCard, dragged]);

   const onDragStart = React.useCallback((event: DragStartEvent): void => {
     const cardId = String(event.active.id);
     console.debug("[KanbanBoard] onDragStart, cardId:", cardId);
     dragged.onDragStart(cardId);
   }, [dragged]);

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
    <DndContext
      onDragEnd={dragged.onDragEnd}
      onDragStart={dragged.onDragStart}
      collisionDetection={pointerWithin}
    >
      <div className={classNames(styles.board, "board")}>
        {kanban.columnOrder.map((order) => (
          <Column key={order.key} id={order.key} label={order.label} group={kanban.columns.get(order.key)} />
        ))}
      </div>
      <DragOverlay
        modifiers={[snapCenterToCursor]}
      >
         {dragged.entry && (
            <OverlayCard entry={dragged.entry}  />
         )}
       </DragOverlay>
    </DndContext>
  );
};


