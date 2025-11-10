import { useEffect, useState, useCallback } from 'react';
import { BasesQueryResult, TFile } from 'obsidian';
import { useApp } from './useApp';

/**
 * Kanban data state
 */
export interface KanbanData {
  queryResult: BasesQueryResult | null;
  loading: boolean;
  error: Error | null;
}

/**
 * useKanbanData hook manages data fetching and state for the kanban board
 * 
 * Fetches data from Obsidian Bases API and manages loading/error states.
 * Updates whenever the query result changes.
 * 
 * @param baseId - The Bases ID to fetch data from
 * @param queryId - The Query ID to fetch from
 * @returns KanbanData with queryResult, loading, and error states
 */
export const useKanbanData = (baseId?: string, queryId?: string): KanbanData => {
  const app = useApp();
  const [queryResult, setQueryResult] = useState<BasesQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch data from Obsidian Bases API
   */
  const fetchData = useCallback(async (): Promise<void> => {
    if (!baseId || !queryId) {
      console.debug('[useKanbanData] Missing baseId or queryId, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.debug('[useKanbanData] Fetching data', { baseId, queryId });

      // Access Obsidian Bases API
      const basesApi = (app as any).bases;
      if (!basesApi) {
        throw new Error('Bases API not available');
      }

      // Get base
      const base = await basesApi.getBase(baseId);
      if (!base) {
        throw new Error(`Base not found: ${baseId}`);
      }

      // Get query
      const query = await base.getQuery(queryId);
      if (!query) {
        throw new Error(`Query not found: ${queryId}`);
      }

      // Execute query to get results
      const result = await query.execute();
      if (!result) {
        throw new Error('Query execution returned null');
      }

      console.debug('[useKanbanData] Data fetched successfully', {
        itemCount: result.data?.length || 0,
        hasGroupedData: !!result.groupedData
      });

      setQueryResult(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useKanbanData] Error fetching data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [app, baseId, queryId]);

  /**
   * Fetch data on mount and when dependencies change
   */
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    queryResult,
    loading,
    error
  };
};

/**
 * Hook to update entry property values
 */
export const useUpdateEntry = () => {
  const app = useApp();

  /**
   * Update an entry property value
   */
  const updateEntry = useCallback(
    async (entryPath: string, propertyId: string, value: unknown): Promise<void> => {
      try {
        console.debug('[useUpdateEntry] Updating entry', {
          entryPath,
          propertyId,
          value
        });

        // Access file manager to update frontmatter
        const file = app.vault.getAbstractFileByPath(entryPath);
        if (!file || !(file instanceof TFile)) {
          throw new Error(`File not found: ${entryPath}`);
        }

        // Update file frontmatter with new property value
        await app.fileManager.processFrontMatter(file as TFile, (frontmatter: Record<string, unknown>) => {
          frontmatter[propertyId] = value;
        });

        console.debug('[useUpdateEntry] Entry updated successfully');
      } catch (error) {
        console.error('[useUpdateEntry] Error updating entry:', error);
        throw error;
      }
    },
    [app]
  );

  return {
    updateEntry
  };
};
