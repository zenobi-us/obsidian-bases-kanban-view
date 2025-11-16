import React, { createContext, useContext, PropsWithChildren } from "react";
import { KanbanStateControllerUpdatedEventData } from "../utils/KanbanStateController";
import Type from "typebox";
import Value from "typebox/value";
import { BasesViewConfig } from "obsidian";



interface KanbanContextProps extends PropsWithChildren<{
  error?: Error;
  loading?: boolean;
  config: KanbanStateControllerUpdatedEventData["config"];
  fields: KanbanStateControllerUpdatedEventData["fields"];
  columns: KanbanStateControllerUpdatedEventData["columns"];
  columnOrder: KanbanStateControllerUpdatedEventData["columnOrder"];
  entries: KanbanStateControllerUpdatedEventData["entries"];
  moveCard: (cardId: string, targetGroupId: string) => Promise<void>;
}> {}

interface KanbanContextType extends Omit<KanbanContextProps, "children"> {
}

const KanbanContext = createContext<KanbanContextType | undefined>(
  undefined,
);

export const KanbanProvider = ({
  children,
  ...props
}: KanbanContextProps): React.ReactElement => {
  return (
    <KanbanContext.Provider value={props}>
      {children}
    </KanbanContext.Provider>
  );
};

/**
 * Hook to access kanban context
 * Must be used within KanbanProvider
 */
export const useKanban = (): KanbanContextType => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within KanbanProvider");
  }
  return context;
};



