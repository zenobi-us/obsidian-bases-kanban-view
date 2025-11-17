import { BasesEntry, BasesEntryGroup, BasesPropertyId, BasesQueryResult, BasesViewConfig, QueryController, App, TFile, FileManager } from "obsidian";
import Emittery from "emittery";
import { toSentenceCase, toSlugCase } from "./strings";
import { IsObject } from "typebox/type";

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
export type KanbanConfig = ReturnType<typeof ConfigParser>;

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
   private config: ReturnType<typeof ConfigParser> | null = null;

   constructor(
     private app: App,
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
    const config = ConfigParser(data.config);
    const columnOrder = this.getColumnOrder(config.columnNames);
    const columns = this.createColumnMap(data.groupedData);
    const entries = this.indexEntriesBy(data.data, 'file.path');

    this.config = config;
    
    this.groups.clear();

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
   * Move a card (entry) to a different column (group) by updating its grouping property
   * 
   * @param entryPath - The file path of the card to move
   * @param targetGroupId - The target column ID (the new value for the grouping property)
   */
  async moveCard(entryPath: string, targetGroupId: string): Promise<void> {
    if (!this.config) {
      throw new Error("Kanban config not initialized");
    }

    try {
      console.debug(`[KanbanStateController] moveCard called with entryPath: ${entryPath}, targetGroupId: ${targetGroupId}`);

      // Validate inputs
      if (!entryPath || !targetGroupId) {
        throw new Error("entryPath and targetGroupId are required");
      }


      // Get the file from the vault
      const file = this.app.vault.getFileByPath(entryPath);
      if (!file) {
        throw new Error(`File not found for entryPath: ${entryPath}`);
      }

      // Update the file's frontmatter with the new property value
      // The property name should be extracted from the BasesPropertyId (e.g., "note.status" -> "status")
      const propertyName = this.extractPropertyName(this.config.columnProperty);
      
      await this.app.fileManager.processFrontMatter(
        file,
        // fake the type for frontmatter (it should be an object)
        (frontmatter: undefined | null | Record<string, unknown>) => {
          if (!IsObject(frontmatter)) {
            throw new Error("Invalid frontmatter format");
          }

          frontmatter[propertyName] = targetGroupId;
        }
      );

      console.debug(`[KanbanStateController] Successfully moved card ${entryPath} to ${targetGroupId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[KanbanStateController] Error moving card: ${errorMessage}`,
        { entryPath, targetGroupId, columnProperty: this.config?.columnProperty }
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

}

function ConfigParser(config: BasesViewConfig) {

  const controller = {
    get (key: string) { return config.get(key)?.toString() || ''},
    property (key: string, defaultValue: string): BasesPropertyId {
      const value = config.get(key)?.toString();

      if (!value || !value.match(/^(note|file|formula)\..+$/)) {
        return defaultValue as BasesPropertyId;
      }
      
      return value.toString() as BasesPropertyId;
    },
  }
  
  const configData = {
    columnNames: controller.get("kanban-columnNames") || 'To Do,In Progress,Done',
    columnProperty: controller.property("kanban-columnProperty", "note.status"),
    card: {
      titleField: controller.property("kanban-cardTitleField", "note.title"),
      tagField: controller.property("kanban-cardTagField", "note.tags"),
      typeField: controller.property("kanban-cardTypeField", "note.type"),
      storyPointsField:
        controller.property("kanban-cardStoryPointsField", "note.storyPoints"),
      priorityField:
        controller.property("kanban-cardPriorityField", "note.priority"),
    },
  }
  return configData;

}

