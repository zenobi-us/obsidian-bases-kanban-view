import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  PropsWithChildren,
} from "react";
import { QueryController, App } from "obsidian";
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
 * - moveCard handler has access to app and queryController for persistence
 * - Components are pure rendering functions with no state
 * - Loading/error states propagate to UI
 */
export interface GroupingProviderProps extends PropsWithChildren {
  app: App;
  groupByFieldId: string | null;
  queryController: QueryController;
  groupedData?: GroupedDataItem[];
  baseId?: string;
  queryId?: string;
}

export const GroupingProvider = ({
  app,
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

          // Update entry property via Obsidian API
          // targetGroupId is the property value to set (e.g., "Done", "In Progress")
          if (!groupByFieldId) {
            console.warn(
              "[GroupingContext] Cannot move card: groupByFieldId not set",
            );
            return;
          }

          // Get the file from the entry
          const file = entry.file;
          if (!file) {
            console.error("[GroupingContext] Entry has no file:", cardId);
            return;
          }

          // Extract field name from BasesPropertyId (format: "type.fieldName")
          // Frontmatter keys use only the field name, not the type prefix
          const fieldNameParts = String(groupByFieldId).split('.');
          const frontmatterKey = fieldNameParts.length > 1 
            ? fieldNameParts.slice(1).join('.')
            : groupByFieldId;

          // Update the entry's property value in the file's frontmatter
          await app.fileManager.processFrontMatter(
            file,
            (frontmatter: any) => {
              // Convert targetGroupId to the actual property value
              // If targetGroupId is "Backlog" (null group), set to null
              if (targetGroupId === "Backlog") {
                frontmatter[frontmatterKey] = null;
              } else {
                frontmatter[frontmatterKey] = targetGroupId;
              }
              console.debug("[GroupingContext] Updated frontmatter:", {
                cardId,
                propertyId: groupByFieldId,
                frontmatterKey,
                value: frontmatter[frontmatterKey],
              });
            },
          );

         console.debug("[GroupingContext] Card moved successfully:", {
           cardId,
           from: sourceGroup.id,
           to: targetGroupId,
         });
       } catch (error) {
         console.error("[GroupingContext] Error moving card:", error);
         throw error;
       }
     },
     [groups, groupByFieldId, queryController, app],
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
