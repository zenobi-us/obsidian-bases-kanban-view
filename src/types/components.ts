import { BasesEntry, BasesQueryResult, BasesPropertyId } from 'obsidian';

/**
 * Obsidian API GroupedData structure for representing grouped entries
 */
export interface GroupedDataItem {
  key: string | null | undefined;
  entries: BasesEntry[];
}

/**
 * Configuration for the Kanban Board component
 */
export interface KanbanBoardProps {
  queryResult: BasesQueryResult & { groupedData?: GroupedDataItem[] };
  groupByPropertyId: string | null;
  allProperties: BasesPropertyId[];
}

/**
 * Represents a single group/column in the kanban board
 */
export interface KanbanGroup {
  id: string;
  label: string;
  entries: BasesEntry[];
}

/**
 * Column component props
 */
export interface ColumnProps {
  group: KanbanGroup;
  onCardDrop: (cardId: string, targetGroupId: string) => Promise<void>;
}

/**
 * Card component props
 */
export interface CardProps {
  entry: BasesEntry;
  allProperties: BasesPropertyId[];
  onCardDrop: (cardId: string, targetGroupId: string) => Promise<void>;
  isDragging?: boolean;
}

/**
 * Virtual scroller state
 */
export interface VirtualScrollerState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

/**
 * Virtual scroller hook result
 */
export interface UseVirtualScrollerResult {
  virtualScroller: VirtualScrollerState;
  containerRef: React.RefObject<HTMLDivElement>;
  innerHeight: number;
}

/**
 * Kanban state manager
 */
export interface KanbanState {
  groups: KanbanGroup[];
  loading: boolean;
  error: Error | null;
}
