import React from "react";
import { App } from "obsidian";
import { AppProvider } from "../context/AppContext";
import { KanbanProvider, } from "../context/KanbanContext";
import { KanbanStateControllerUpdatedEventData } from "../utils/KanbanStateController";
import { KanbanBoard } from "./KanbanBoard";

/**
 * KanbanView component serves as the root React component for the kanban board view
 *
 * Wraps children with:
 * - AppProvider: provides Obsidian app instance
 * - GroupingProvider: manages grouping state and provides handlers
 *
 * @param props - KanbanViewProps with app, queryController, queryResult, etc.
 * @returns React element rendering the kanban board with context providers
 */
export const KanbanView = (props: {
  app: App;
  columnOrder: KanbanStateControllerUpdatedEventData["columnOrder"];
  columns: KanbanStateControllerUpdatedEventData["columns"];
  fields: KanbanStateControllerUpdatedEventData["fields"];
  entries: KanbanStateControllerUpdatedEventData["entries"];
  onCardMove: (cardId: string, targetGroupId: string) => Promise<void>;
  onCardClick?: (cardId: string) => void;
}): React.ReactElement => {
  console.log("Rendering KanbanView with props:", props);
  return (
    <AppProvider app={props.app}>
      <KanbanProvider
        columns={props.columns}
        columnOrder={props.columnOrder}
        fields={props.fields}
        entries={props.entries}
        moveCard={props.onCardMove}
      >
        <KanbanBoard />
      </KanbanProvider>
    </AppProvider>
  );
};
