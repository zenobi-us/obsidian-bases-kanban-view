import { BasesEntry, BasesEntryGroup, BasesPropertyId, BasesQueryResult, BasesViewConfig, QueryController } from "obsidian";
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
export type KanbanConfig = BasesViewConfig;

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

  constructor(
    private queryController: QueryController,
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
    const config = data.config;
    const columns = KanbanStateController.createColumnMap(data.groupedData);
    const columnOrder = KanbanStateController.getColumnOrder(config);
    const entries = KanbanStateController.indexEntriesBy(data.data, 'note.path');
    
    
    this.groups.clear();

    // Placeholder implementation
    console.log("[StateManager] collate called with data:", data);
    // Actual implementation would process and organize the data
    this.emit("updated", {
      columns,
      columnOrder,
      fields,
      entries,
      config,
    });
  }

  static indexEntriesBy(entries: BasesEntry[], property: BasesPropertyId): Map<string, BasesEntry> {
    const entryMap = new Map<string, BasesEntry>();
    for (const entry of entries) {
      const key = entry.getValue(property);
      if (key) {
        entryMap.set(key.toString(), entry);
      }
    }
    return entryMap;
  }

  static createColumnMap(groups: KanbanGroup[]): Map<string, KanbanGroup> {
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

  static getColumnOrder(config: BasesViewConfig): {key: string, label: string}[] {
    if (!config) {
      return [];
    }
    // Placeholder implementation
    console.log("[StateManager] getColumns called", config);
    const columnNamesValue = config.get("kanban-columnNames");
    if (!columnNamesValue || typeof columnNamesValue !== "string") {
      return [];
    }

    const columnNames = columnNamesValue.split(",").map(name => name.trim());
    return columnNames.map(name => ({ key: toSlugCase(name), label: toSentenceCase(name) }));
  }

  async moveCard(cardId: string, targetGroupId: string): Promise<void> {
    // Placeholder implementation
    console.log(
      `[StateManager] moveCard called with cardId: ${cardId}, targetGroupId: ${targetGroupId}`
    );
    // Actual implementation would update the underlying data source
  }
}