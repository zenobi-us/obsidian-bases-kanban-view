import { BasesView, QueryController, ViewOption, HoverParent } from "obsidian";
import { ReactMountManager } from "../utils/reactMount";
import globalStyles from "../styles/global.css?raw";

export class KanbanBasesView extends BasesView {
  private containerEl: HTMLElement;
  private queryController: QueryController;
  private groupByFieldId: string | null = null;
  private columnOrderMap: Map<string, string[]> = new Map();
  private reactMountManager: ReactMountManager | null = null;

  readonly type = "kanban";

  constructor(controller: QueryController, element: HTMLElement) {
    super(controller);
    this.queryController = controller;
    // Use provided element directly instead of creating a wrapper
    this.containerEl = element;
    this.containerEl.classList.add("kanban-bases-view-container");
    this.reactMountManager = new ReactMountManager();
  }

  private loadColumnOrder(): void {
    // Load column name order from config (comma-separated list)
    if (this.config) {
      const columnNames = this.config.get("kanban-columnNames");
      if (columnNames && typeof columnNames === "string") {
        // Parse comma-separated column names
        const names = columnNames
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);
        if (names.length > 0) {
          // Set as the default column order
          this.columnOrderMap.set("default", names);
        }
      }
    }
  }

  private saveColumnOrder(): void {
    // Save column order to config
    if (this.config) {
      const data = Object.fromEntries(this.columnOrderMap);
      this.config.set("kanban-columnOrder", JSON.stringify(data));

      // Also update kanban-columnNames with the new order
      const groupKey = this._getColumnIdKey();
      const columnOrder = this.columnOrderMap.get(groupKey) || [];
      if (columnOrder.length > 0) {
        this.config.set("kanban-columnNames", columnOrder.join(","));
      }
    }
  }

  onload(): void {
    // Stub for now
  }

  onunload(): void {
    // Unmount React component
    if (!this.reactMountManager) {
      return;
    }
    this.reactMountManager.unmount();
    this.reactMountManager = null;
  }

  onDataUpdated(): void {
    if (!this.data) {
      console.warn("[KanbanBasesView] onDataUpdated called but data is null");
      return;
    }
    this.loadConfig();
    this.render();
  }

  private render(): void {
    if (!this.containerEl) {
      console.warn("[KanbanBasesView] containerEl not initialized");
      return;
    }

    this.containerEl.empty();

    if (!this.config || !this.data) {
      this.renderNoGroupingError();
      return;
    }

    if (!this.data.groupedData || this.data.groupedData.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Inject global CSS styles once
    if (!document.getElementById("kanban-global-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "kanban-global-styles";
      styleEl.textContent = globalStyles;
      document.head.appendChild(styleEl);
      console.debug("[KanbanBasesView] Global styles injected");
    }

    try {
      // Extract grouping field ID from the groupedData structure
      // If not available from API, use first property as fallback (drag-drop support to be added later)
      if ((this.data.groupedData as any).fieldId) {
        this.groupByFieldId = (this.data.groupedData as any).fieldId;
      } else if (this.data.properties && this.data.properties.length > 0) {
        // Fallback: use first property ID for now
        this.groupByFieldId = this.data.properties[0];
        console.debug(
          "[KanbanBasesView] Using first property as groupByFieldId:",
          this.groupByFieldId,
        );
      } else {
        this.groupByFieldId = "unknown";
        console.warn(
          "[KanbanBasesView] No properties available, using placeholder groupByFieldId",
        );
      }

      // Mount React component to render kanban board
      if (this.reactMountManager && this.groupByFieldId) {
        this.reactMountManager.mount(
          this.containerEl,
          this.app,
          this.queryController,
          this.data,
          this.groupByFieldId,
          this.data.properties || [],
        );
        console.debug("[KanbanBasesView] React component mounted successfully");
      } else {
        console.warn("[KanbanBasesView] Cannot mount React: missing manager");
      }
    } catch (error) {
      console.error("[KanbanBasesView] Failed to render with React:", error);
    }
  }

  private loadConfig(): void {
    if (this.config) {
      // Grouping config is no longer needed - it's handled by Obsidian's groupedData
    }
    this.loadColumnOrder();
  }

  private _getColumnIdKey(): string {
    // Key for storing column order/seen columns - using default as we don't have grouping config anymore
    return "default";
  }

  private renderNoGroupingError(): void {
    if (!this.containerEl) {
      console.error(
        "[KanbanBasesView] Cannot render error: containerEl is null",
      );
      return;
    }
    const errorEl = this.containerEl.createDiv("kanban-error");
    errorEl.createEl("p", {
      text: "No data available. Configure your Bases query to see items in the Kanban view.",
      cls: "kanban-error-message",
    });
  }

  private renderEmptyState(): void {
    if (!this.containerEl) {
      console.error(
        "[KanbanBasesView] Cannot render empty state: containerEl is null",
      );
      return;
    }
    const emptyEl = this.containerEl.createDiv("kanban-empty");
    emptyEl.createEl("p", {
      text: "No items to display. Add items to this Base to see them in the Kanban view.",
      cls: "kanban-empty-message",
    });
  }
  static getViewOptions(): ViewOption[] {
    const output: ViewOption[] = [
      {
        type: "text",
        displayName: "Column order",
        key: "kanban-columnNames",
        default: "Backlog,Todo,In Progress,In Review,Done",
        placeholder: "e.g., Backlog,Todo,In Progress,In Review,Done",
      },
    ];
    return output;
  }
}
