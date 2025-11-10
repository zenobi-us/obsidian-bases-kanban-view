import { Root, createRoot } from 'react-dom/client';
import { App, BasesQueryResult, BasesPropertyId, QueryController } from 'obsidian';
import { KanbanView } from '../components/KanbanView';

/**
 * Manages React root mounting and lifecycle
 */
export class ReactMountManager {
  private root: Root | null = null;
  private container: HTMLElement | null = null;

  /**
    * Mount React component into DOM
    */
  public mount(
    container: HTMLElement,
    app: App,
    queryController: QueryController,
    queryResult: BasesQueryResult,
    groupByPropertyId: string | null,
    allProperties: BasesPropertyId[]
  ): void {
    try {
      // Create new root if needed
      if (!this.root || this.container !== container) {
        this.container = container;
        this.root = createRoot(container);
        console.debug('[ReactMountManager] Created new React root');
      }

      // Render KanbanView component
      this.root.render(
        <KanbanView
          app={app}
          queryController={queryController}
          queryResult={queryResult}
          groupByPropertyId={groupByPropertyId}
          allProperties={allProperties}
        />
      );

      console.debug('[ReactMountManager] React component mounted successfully');
    } catch (error) {
      console.error('[ReactMountManager] Error mounting React component:', error);
      throw error;
    }
  }

  /**
   * Unmount React component and cleanup
   */
  public unmount(): void {
    try {
      if (this.root) {
        this.root.unmount();
        this.root = null;
        this.container = null;
        console.debug('[ReactMountManager] React component unmounted successfully');
      }
    } catch (error) {
      console.error('[ReactMountManager] Error unmounting React component:', error);
    }
  }

  /**
   * Check if component is currently mounted
   */
  public isMounted(): boolean {
    return this.root !== null;
  }
}
