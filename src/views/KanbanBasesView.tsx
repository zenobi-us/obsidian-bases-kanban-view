import React from "react";
import { Root, createRoot } from "react-dom/client";
import { BasesView, QueryController, ViewOption } from "obsidian";
import { KanbanView } from "../components/KanbanView";
import { isKanbanQueryResult, KanbanStateController, KanbanStateControllerUpdatedEventData } from "../utils/KanbanStateController";

export class KanbanBasesView extends BasesView {
  readonly type = "kanban";

  private controller: KanbanStateController;
  private root: Root | null = null;
  private element: HTMLElement | null = null;
  
  constructor(
    controller: QueryController,
    element: HTMLElement
  ) {
    super(controller);
    
    this.controller = new KanbanStateController(controller)
    this.element = element;
    this.root = createRoot(this.element);

    this.controller.on('updated', (data) => {
      this.render(data);
    })
  }

  onload(): void {
    console.log("[KanbanBasesView] onload called");
  }

  onunload(): void {
    console.log("[KanbanBasesView] onunload called");

    if (!this.root) {
      return;
    }
    this.root?.unmount();
    this.root = null;
  }

  /**
   * 
   * Handle data updates from Bases API
   * 
   */
  onDataUpdated(): void {
    console.log("[KanbanBasesView] onDataUpdated called");
    if (!isKanbanQueryResult(this.data)) {
      return;
    }

    this.controller.update(this.data);
  }

  async onCardClick(cardId: string): Promise<void> {
    console.log("[KanbanBasesView] onCardClick called with cardId:", cardId);
  }

  async onCardMove(cardId: string, targetGroupId: string): Promise<void> {
    console.log("[KanbanBasesView] onCardMove called with cardId:", cardId, "and targetGroupId:", targetGroupId);
  }

  render(data: KanbanStateControllerUpdatedEventData): void {
    if (!this.element) {
      return;
    }

    if (this.root) {
      console.log("[KanbanBasesView] Unmounting existing root before re-render");
      this.root.unmount();
      this.root = null;
    }

    console.log("[KanbanBasesView] Creating new root for rendering");

    this.root = createRoot(this.element);

    this.root.render(
      <KanbanView
        app={this.app}
        columns={data.columns}
        columnOrder={data.columnOrder}
        fields={data.fields}
        entries={data.entries}
        onCardClick={async (cardId) => this.onCardClick(cardId)}
        onCardMove={async (cardId, targetGroupId) => {
          this.onCardMove(cardId, targetGroupId);
        }}
      />,
    );
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
