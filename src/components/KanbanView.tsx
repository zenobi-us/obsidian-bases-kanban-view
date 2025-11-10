import { App, BasesQueryResult, BasesPropertyId, QueryController } from 'obsidian';
import { AppProvider } from '../context/AppContext';
import { KanbanBoard } from './KanbanBoard';

/**
 * KanbanView component integrates the entire kanban board with Obsidian integration
 * This component wraps KanbanBoard with AppProvider for context access
 */
export interface KanbanViewProps {
  app: App;
  queryController: QueryController;
  queryResult: BasesQueryResult;
  groupByPropertyId: string | null;
  allProperties: BasesPropertyId[];
}

/**
 * KanbanView component serves as the root React component for the kanban board view
 * 
 * @param props - KanbanViewProps with app, queryController, queryResult, etc.
 * @returns React element rendering the kanban board with context providers
 */
export const KanbanView = ({
  app,
  queryResult,
  groupByPropertyId,
  allProperties
}: KanbanViewProps): React.ReactElement => {
  return (
    <AppProvider app={app}>
      <KanbanBoard
        queryResult={queryResult as any}
        groupByPropertyId={groupByPropertyId}
        allProperties={allProperties}
      />
    </AppProvider>
  );
};
