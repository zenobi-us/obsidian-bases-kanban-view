import React, { createContext, useContext, PropsWithChildren } from "react";
import { KanbanStateControllerUpdatedEventData } from "../utils/KanbanStateController";


export interface KanbanContextType {
  error?: Error;
  loading?: boolean;
  fields: KanbanStateControllerUpdatedEventData["fields"];
  columns: KanbanStateControllerUpdatedEventData["columns"];
  columnOrder: KanbanStateControllerUpdatedEventData["columnOrder"];
  entries: KanbanStateControllerUpdatedEventData["entries"];
  moveCard: (cardId: string, targetGroupId: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(
  undefined,
);



export interface KanbanProviderProps
  extends PropsWithChildren,
    KanbanContextType {}

export const KanbanProvider = ({
  children,
  ...props
}: KanbanProviderProps): React.ReactElement => {
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
