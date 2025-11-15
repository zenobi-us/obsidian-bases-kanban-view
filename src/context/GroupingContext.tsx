import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  PropsWithChildren,
} from "react";
import { QueryController } from "obsidian";
import { KanbanGroup, GroupedDataItem } from "../types/components";
import { useKanbanData } from "../hooks/useKanbanData";

/**
 * GroupingContext provides state and handlers for kanban board grouping logic.
 * This context centralizes all state management, eliminating prop drilling and
 * ensuring components update automatically when data changes.
 */

export interface GroupingContextType {
  groups: KanbanGroup[];
  moveCard: (cardId: string, targetGroupId: string) => Promise<void>;
  getSourceGroup: (cardId: string) => KanbanGroup | undefined;
  loading: boolean;
  error: Error | null;
}

const GroupingContext = createContext<GroupingContextType | undefined>(
  undefined,
);

/**
 * GroupingProvider wraps components and provides grouping state and handlers.
 *
 * Key features:
 * - Fetches data from Obsidian Bases API via useKanbanData
 * - useMemo groups entries whenever groupByFieldId changes
 * - Entries are auto-updated from API, triggering re-groups
 * - moveCard handler has access to queryController for persistence
 * - Components are pure rendering functions with no state
 * - Loading/error states propagate to UI
 */
export interface GroupingProviderProps extends PropsWithChildren {
  groupByFieldId: string | null;
  queryController: QueryController;
  groupedData?: GroupedDataItem[];
  baseId?: string;
  queryId?: string;
}

export const GroupingProvider = ({
  children,
  groupByFieldId,
  queryController,
  groupedData,
  baseId,
  queryId,
}: GroupingProviderProps): React.ReactElement => {
  /**
   * Fetch data from Obsidian Bases API
   * This provides loading and error states for display
   */
  const { queryResult, loading, error } = useKanbanData(baseId, queryId);

  /**
   * Determine data source: either from hook fetch or from prop
   * Priority: fetched data > prop data (for backwards compatibility)
   */
  const dataToUse = useMemo((): GroupedDataItem[] => {
    if (baseId && queryId && queryResult) {
      // Use fetched data if baseId and queryId provided
      return (queryResult as any)?.groupedData || [];
    }
    // Fallback to prop data for backwards compatibility
    return groupedData || [];
  }, [baseId, queryId, queryResult, groupedData]);

  /**
   * Convert Obsidian groupedData to KanbanGroup array
   * This runs whenever data or groupByFieldId changes, ensuring fresh data
   */
  const groups = useMemo((): KanbanGroup[] => {
    if (!dataToUse || dataToUse.length === 0) {
      return [];
    }

    const result: KanbanGroup[] = dataToUse.map((group) => ({
      id:
        group.key === null || group.key === undefined
          ? "Backlog"
          : String(group.key),
      label:
        group.key === null || group.key === undefined
          ? "Backlog"
          : String(group.key),
      entries: group.entries || [],
    }));

    console.debug("[GroupingContext] Groups updated:", {
      count: result.length,
      groupByFieldId,
      totalEntries: result.reduce((sum, g) => sum + g.entries.length, 0),
    });

    return result;
  }, [dataToUse, groupByFieldId]);

  /**
   * Move card from source group to target group
   * Calls Obsidian API to update the entry property
   * KanbanBasesView.onDataUpdated() will trigger, flowing new data down
   */
  const moveCard = useCallback(
    async (cardId: string, targetGroupId: string): Promise<void> => {
      try {
        const sourceGroup = groups.find((g) =>
          g.entries.some((entry) => entry.file.path === cardId),
        );

        if (!sourceGroup) {
          console.warn(
            "[GroupingContext] Source group not found for card:",
            cardId,
          );
          return;
        }

        const entry = sourceGroup.entries.find((e) => e.file.path === cardId);
        if (!entry) {
          console.warn("[GroupingContext] Entry not found:", cardId);
          return;
        }

        console.debug("[GroupingContext] Moving card:", {
          cardId,
          from: sourceGroup.id,
          to: targetGroupId,
          groupByFieldId,
        });

        // TODO: Implement entry property update via queryController API
        // This will be done in Story 4.5.6
        // For now, just log to verify flow
        console.debug(
          "[GroupingContext] TODO: Update entry property via queryController",
        );
      } catch (error) {
        console.error("[GroupingContext] Error moving card:", error);
        throw error;
      }
    },
    [groups, groupByFieldId, queryController],
  );

  /**
   * Find source group for a given card
   * Used by components to determine drag source
   */
  const getSourceGroup = useCallback(
    (cardId: string): KanbanGroup | undefined => {
      return groups.find((g) =>
        g.entries.some((entry) => entry.file.path === cardId),
      );
    },
    [groups],
  );

   const value: GroupingContextType = {
     groups,
     moveCard,
     getSourceGroup,
     loading,
     error,
   };

  return (
    <GroupingContext.Provider value={value}>
      {children}
    </GroupingContext.Provider>
  );
};

/**
 * Hook to access grouping context
 * Must be used within GroupingProvider
 */
export const useGrouping = (): GroupingContextType => {
  const context = useContext(GroupingContext);
  if (!context) {
    throw new Error("useGrouping must be used within GroupingProvider");
  }
  return context;
};
