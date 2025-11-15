import Emittery from "emittery";
import { BasesViewConfig } from "obsidian";
import { useMemo, useState } from "react";

export class ConfigController extends Emittery<{
  update: BasesViewConfig;
}>{

  constructor(
    private config: BasesViewConfig | undefined,
  ) {
    super();
  }

  update(newConfig: BasesViewConfig) {
    this.config = newConfig;
    this.emit("update", newConfig);
  }

  getColumnNames (){
    // Load column name order from config (comma-separated list)
    if (!this.config) {
      return;
    }

    const columnNames = this.config.get("kanban-columnNames");
    if (columnNames && typeof columnNames === "string") {
      // Parse comma-separated column names
      const names = columnNames
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      if (names.length > 0) {
        return names;
      }

      return [];
    }
  }

  setColumnNames(names: string[]) {
    // Save column order to config
    if (!this.config) {
      return;
    }

    this.config.set("kanban-columnNames", JSON.stringify(names));
  }

}