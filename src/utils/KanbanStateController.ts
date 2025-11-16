import { BasesEntry, BasesEntryGroup, BasesPropertyId, BasesQueryResult, BasesViewConfig, QueryController, App, TFile, FileManager } from "obsidian";
import Emittery from "emittery";
import { toSentenceCase, toSlugCase } from "./strings";

/**
 * Types representing data coming in from Obsidian Bases API for Kanban view
 */
type WithObsidianConfig<T> = T & { config: BasesViewConfig };
// type WithObsidianGroupedData<T> = T & { groupedData: Array<KanbanColumn> };
type WithObsidianProperties<T> = T & { properties: string[] };

export type ObsidianKanbanbaseQueryResult = WithObsidianProperties<WithObsidianConfig<BasesQueryResult>>;
export function isKanbanQueryResult(
  data: unknown,
): data is ObsidianKanbanbaseQueryResult {
  return (
    (data as ObsidianKanbanbaseQueryResult).groupedData !== undefined &&
    (data as ObsidianKanbanbaseQueryResult).properties !== undefined &&
    (data as ObsidianKanbanbaseQueryResult).config !== undefined &&
    (data as ObsidianKanbanbaseQueryResult).data !== undefined
  );
}

/**
 * Types Representing parsed and processed obsidian kanban data
 */
// export type KanbanColumnKey = { icon: string; data: string };
// export type KanbanColumn = { entries: BasesEntry[]; key: KanbanColumnKey }
export type KanbanGroup = BasesEntryGroup
export type KanbanBoard = Map<string, KanbanGroup>;
export type KanbanCardFieldName = ObsidianKanbanbaseQueryResult["properties"];
export type KanbanConfig = ReturnType<KanbanStateController['createKanbanConfig']>;

export type KanbanStateControllerUpdatedEventData = {
  columnOrder: {key: string, label: string}[];
  columns: Map<string, KanbanGroup>;
  entries: Map<string, BasesEntry>;
  fields: KanbanCardFieldName;
  config: KanbanConfig;
};

export class KanbanStateController extends Emittery<{
   updated: KanbanStateControllerUpdatedEventData;
}> {
   public groups: Map<string, KanbanGroup> = new Map();
   private groupByPropertyId: BasesPropertyId | null = null;

   constructor(
     private queryController: QueryController,
     private app: App,
     private config?: BasesViewConfig,
   ) {
     super();
   }

  /**
    * Takes new data as BasesQueryResult.
    * 
    * 
     * Data we care about: 
     * 
     * - this.data.propertiesCache: contains the fields the user has ticked to show We should use this to show in the cards
     * - this.data.groupedDataCache: contains the entries grouped by the field we are using for kanban columns
     *   Format of this is [ { entries: BasesEntry[], key: { icon: string, data: string } } ]
     * - this.data.config.data: contains the view config. We care about "kanban-columnNames" for column ordering
     * 
     * collates it into grouped structure for kanban board.
     * 
     * 1. empty existing groups
     * 2. iterate over data entries
     * 3. assign each entry to appropriate group based on criteria
     * 4. update this.groups map
     * 
     * @param data - BasesQueryResult containing latest data entries
     */
   update(data: ObsidianKanbanbaseQueryResult): void {
     const fields = data.properties;
     const config = this.createKanbanConfig(data.config);
     const columns = this.createColumnMap(data.groupedData);
     const columnOrder = this.getColumnOrder(config.columnNames);
     const entries = this.indexEntriesBy(data.data, 'file.path');
     
     // Infer the grouping property by looking at the first entry in groupedData
     // and finding which property matches the group key
     if (!this.groupByPropertyId) {
       this.inferGroupByProperty(data);
     }
     
     this.groups.clear();

     console.log("[KanbanStateController] Data updated with groupByPropertyId:", this.groupByPropertyId);
     this.emit("updated", {
       columns,
       columnOrder,
       fields,
       entries,
       config,
     });
   }

  indexEntriesBy(entries: BasesEntry[], property: BasesPropertyId): Map<string, BasesEntry> {
    const entryMap = new Map<string, BasesEntry>();
    console.log("[StateManager] indexEntriesBy called with property:", { entries, property });
    for (const entry of entries) {
      
      const key = entry.getValue(property);
      if (!key) {
        console.warn("[StateManager] Entry property for indexing:", { entry, property });
        continue
      }

      entryMap.set(key.toString(), entry);
    }

    console.log("[StateManager] Indexed entries:", Object.fromEntries(entryMap.entries()));
    return entryMap;
  }

  createColumnMap(groups: KanbanGroup[]): Map<string, KanbanGroup> {
    const columnMap = new Map<string, KanbanGroup>();
    for (const group of groups) {
      if (!group.key) {
        continue;
      }

      const key = toSlugCase(group.key.toString());

      columnMap.set(key, group);
    }
    return columnMap;
  }

  getColumnOrder(columnNames: string): {key: string, label: string}[] {
    if (!columnNames) {
      return [];
    }
    // Placeholder implementation
    console.log("[StateManager] getColumns called", columnNames);

    const columnNamesArray = columnNames.split(",").map(name => name.trim());
    return columnNamesArray.map(name => ({ key: toSlugCase(name), label: toSentenceCase(name) }));
  }

  /**
   * Infer the grouping property by examining the groupedData structure
   * This identifies which property is used to create the kanban columns
   * 
   * @param data - The query result containing groupedData
   */
  private inferGroupByProperty(data: ObsidianKanbanbaseQueryResult): void {
    if (!data.groupedData || data.groupedData.length === 0) {
      console.warn("[KanbanStateController] No groupedData available to infer grouping property");
      return;
    }

    // Get the first group and its first entry to infer the grouping property
    const firstGroup = data.groupedData[0];
    if (!firstGroup.entries || firstGroup.entries.length === 0) {
      console.warn("[KanbanStateController] First group has no entries");
      return;
    }

    const firstEntry = firstGroup.entries[0];
    const groupKey = firstGroup.key?.toString();

    if (!groupKey) {
      console.warn("[KanbanStateController] First group has no key");
      return;
    }

    // Try each property in the entry to find which one matches the group key
    for (const property of data.properties) {
      const propValue = firstEntry.getValue(property as BasesPropertyId);
      if (propValue && propValue.toString() === groupKey) {
        this.groupByPropertyId = property as BasesPropertyId;
        console.debug(`[KanbanStateController] Inferred grouping property: ${property}`);
        return;
      }
    }

    console.warn(`[KanbanStateController] Could not infer grouping property for group key: ${groupKey}`);
  }

  /**
   * Move a card (entry) to a different column (group) by updating its grouping property
   * 
   * @param cardId - The file path of the card to move
   * @param targetGroupId - The target column ID (the new value for the grouping property)
   */
  async moveCard(cardId: string, targetGroupId: string): Promise<void> {
    try {
      console.debug(`[KanbanStateController] moveCard called with cardId: ${cardId}, targetGroupId: ${targetGroupId}`);

      // Validate inputs
      if (!cardId || !targetGroupId) {
        throw new Error("cardId and targetGroupId are required");
      }

      if (!this.groupByPropertyId) {
        throw new Error("Grouping property not yet determined. Wait for first data update.");
      }

      // Get the file from the vault
      const file = this.app.vault.getFileByPath(cardId);
      if (!file) {
        throw new Error(`File not found for cardId: ${cardId}`);
      }

      // Update the file's frontmatter with the new property value
      // The property name should be extracted from the BasesPropertyId (e.g., "note.status" -> "status")
      const propertyName = this.extractPropertyName(this.groupByPropertyId);
      
      await this.app.fileManager.processFrontMatter(
        file,
        (frontmatter: any) => {
          frontmatter[propertyName] = targetGroupId;
        }
      );

      console.debug(`[KanbanStateController] Successfully moved card ${cardId} to ${targetGroupId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[KanbanStateController] Error moving card: ${errorMessage}`,
        { cardId, targetGroupId, groupByPropertyId: this.groupByPropertyId }
      );
      throw error;
    }
  }

  /**
   * Extract the property name from a BasesPropertyId
   * e.g., "note.status" -> "status", "file.name" -> "name"
   * 
   * @param propertyId - The BasesPropertyId to extract from
   * @returns The property name
   */
  private extractPropertyName(propertyId: BasesPropertyId): string {
    const parts = propertyId.split('.');
    return parts[parts.length - 1];
  }

  createKanbanConfig (config: BasesViewConfig) {
    console.log("[KanbanConfig] Creating config from BasesViewConfig:", config);
    if (!config) {
      throw new Error("No config provided");
    }

    const get = (key: string):string => config.get(key)?.toString() || '';
    const property = (key: string, defaultValue: string): BasesPropertyId => {
      const value = config.get(key)?.toString();

      if (!value || !value.match(/^(note|file|formula)\..+$/)) {
        return defaultValue as BasesPropertyId;
      }
      
      return value.toString() as BasesPropertyId;
    }

    const configData = {
      columnNames: get("kanban-columnNames") || 'To Do,In Progress,Done',
      card: {
        titleField: property("kanban-cardTitleField", "note.title"),
        tagField: property("kanban-cardTagField", "note.tags"),
        typeField: property("kanban-cardTypeField", "note.type"),
        storyPointsField:
          property("kanban-cardStoryPointsField", "note.storyPoints"),
        priorityField:
          property("kanban-cardPriorityField", "note.priority"),
      },
    }
    
    return configData;
  }
}



