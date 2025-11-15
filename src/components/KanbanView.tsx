import React from "react";
import {
  App,
  BasesQueryResult,
  BasesPropertyId,
  QueryController,
} from "obsidian";
import { AppProvider } from "../context/AppContext";
import { GroupingProvider } from "../context/GroupingContext";
import { KanbanBoard } from "./KanbanBoard";

/**
 * KanbanView component integrates the entire kanban board with Obsidian integration
 * This component wraps KanbanBoard with context providers for Obsidian app and grouping state
 *
 * Manages data fetching via useKanbanData hook when baseId and queryId are provided.
 * Falls back to static groupedData prop for backwards compatibility.
 */
export interface KanbanViewProps {
  app: App;
  queryController: QueryController;
  queryResult: BasesQueryResult;
  groupByPropertyId: string | null;
  allProperties: BasesPropertyId[];
  baseId?: string;
  queryId?: string;
}

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
export const KanbanView = ({
  app,
  queryController,
  queryResult,
  groupByPropertyId,
  allProperties,
  baseId,
  queryId,
}: KanbanViewProps): React.ReactElement => {
  return (
    <AppProvider app={app}>
      <GroupingProvider
        app={app}
        queryController={queryController}
        groupByFieldId={groupByPropertyId}
        groupedData={(queryResult as any).groupedData}
        baseId={baseId}
        queryId={queryId}
      >
        <KanbanBoard allProperties={allProperties} />
      </GroupingProvider>
    </AppProvider>
  );
};
