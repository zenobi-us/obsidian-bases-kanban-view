import {
	BasesView,
	QueryController,
	ViewOption,
	BasesEntry,
	HoverParent,
	HoverPopover,
} from 'obsidian';
import { VirtualScroller } from '../utils/VirtualScroller';

export class KanbanBasesView extends BasesView implements HoverParent {
	public hoverPopover: HoverPopover | null = null;
	private containerEl: HTMLElement;
	private draggedEntry: BasesEntry | null = null;
	private draggedFromColumnId: string | null = null;
	private draggedColumnId: string | null = null;
	private columnOrderMap: Map<string, string[]> = new Map();
	private hiddenColumns: Set<string> = new Set();

	private virtualScrollers: Map<string, VirtualScroller<BasesEntry>> = new Map();

	readonly type = 'kanban';

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv('kanban-bases-view-container');
	}

	private loadColumnOrder(): void {
		// Load column name order from config (comma-separated list)
		if (this.config) {
			const columnNames = this.config.get('kanban-columnNames');
			if (columnNames && typeof columnNames === 'string') {
				// Parse comma-separated column names
				const names = columnNames
					.split(',')
					.map((name) => name.trim())
					.filter((name) => name.length > 0);
				if (names.length > 0) {
					// Set as the default column order
					this.columnOrderMap.set('default', names);
					console.debug('[KanbanBasesView] Loaded column order from names:', names);
				}
			}
		}

		// Load hidden columns from config
		if (this.config) {
			const hiddenColumnsJson = this.config.get('kanban-hiddenColumns');
			if (hiddenColumnsJson && typeof hiddenColumnsJson === 'string') {
				try {
					const hidden = JSON.parse(hiddenColumnsJson);
					this.hiddenColumns = new Set(hidden as string[]);
					console.debug('[KanbanBasesView] Loaded hidden columns:', Array.from(this.hiddenColumns));
				} catch (e) {
					console.warn('[KanbanBasesView] Failed to load hidden columns:', e);
				}
			}
		}
	}

	private saveColumnOrder(): void {
		// Save column order to config
		if (this.config) {
			const data = Object.fromEntries(this.columnOrderMap);
			this.config.set('kanban-columnOrder', JSON.stringify(data));
			console.debug('[KanbanBasesView] Saved column order');
		}

		// Save hidden columns to config
		if (this.config) {
			this.config.set('kanban-hiddenColumns', JSON.stringify(Array.from(this.hiddenColumns)));
			console.debug('[KanbanBasesView] Saved hidden columns:', Array.from(this.hiddenColumns));
		}
	}

	onload(): void {
		// Stub for now
	}

	onunload(): void {
		// Destroy all virtual scrollers
		for (const scroller of this.virtualScrollers.values()) {
			scroller.destroy();
		}
		this.virtualScrollers.clear();

		// Clean up hover popover
		if (this.hoverPopover) {
			this.hoverPopover.unload();
			this.hoverPopover = null;
		}
	}

	onDataUpdated(): void {
		if (!this.data) {
			console.warn('[KanbanBasesView] onDataUpdated called but data is null');
			return;
		}
		this.loadConfig();
		this.render();
	}

	private render(): void {
		console.debug('[KanbanBasesView] Rendering board using groupedData', {
			hasData: !!this.data,
			hasGroupedData: !!this.data?.groupedData,
		});

		if (!this.containerEl) {
			console.warn('[KanbanBasesView] containerEl not initialized');
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

		this.renderBoard();
	}

	private loadConfig(): void {
		if (this.config) {
			// Grouping config is no longer needed - it's handled by Obsidian's groupedData
			console.debug('[KanbanBasesView] Config loaded (grouping controlled by Obsidian)');
		}
		this.loadColumnOrder();
	}

	private _getColumnIdKey(): string {
		// Key for storing column order/seen columns - using default as we don't have grouping config anymore
		return 'default';
	}

	private renderNoGroupingError(): void {
		if (!this.containerEl) {
			console.error('[KanbanBasesView] Cannot render error: containerEl is null');
			return;
		}
		const errorEl = this.containerEl.createDiv('kanban-error');
		errorEl.createEl('p', {
			text: 'No data available. Configure your Bases query to see items in the Kanban view.',
			cls: 'kanban-error-message',
		});
	}

	private renderEmptyState(): void {
		if (!this.containerEl) {
			console.error('[KanbanBasesView] Cannot render empty state: containerEl is null');
			return;
		}
		const emptyEl = this.containerEl.createDiv('kanban-empty');
		emptyEl.createEl('p', {
			text: 'No items to display. Add items to this Base to see them in the Kanban view.',
			cls: 'kanban-empty-message',
		});
	}

	private renderBoard(): void {
		if (!this.containerEl) {
			console.error('[KanbanBasesView] Cannot render board: containerEl is null');
			return;
		}

		if (!this.data || !this.data.groupedData) {
			console.warn('[KanbanBasesView] renderBoard called but groupedData is missing');
			return;
		}

		const boardEl = this.containerEl.createDiv('kanban-board');

		// Convert groupedData to columnId -> entries format
		const groupedEntries = new Map<string, BasesEntry[]>();

		for (const group of this.data.groupedData) {
			// Use "Backlog" for undefined/null keys
			const columnId = group.key === null || group.key === undefined ? 'Backlog' : String(group.key);
			groupedEntries.set(columnId, group.entries);
		}

		// Get configured column order from columnOrderMap (set from kanban-columnNames)
		const groupKey = this._getColumnIdKey();
		let columnOrder = this.columnOrderMap.get(groupKey) || [];

		// If no columns configured, show nothing (user hasn't set column names yet)
		if (columnOrder.length === 0) {
			this.renderEmptyState();
			return;
		}

		// Render columns in configured order (even if empty)
		for (let i = 0; i < columnOrder.length; i++) {
			const columnId = columnOrder[i];

			// Skip hidden columns
			if (this.hiddenColumns.has(columnId)) {
				continue;
			}

			const entries = groupedEntries.get(columnId) || [];

			// Render drop indicator before this column
			this.renderColumnDropIndicator(boardEl, columnId, 'before');

			// Render the column
			this.renderColumn(boardEl, columnId, entries);
		}

		// Final drop indicator after last column
		const visibleColumns = columnOrder.filter((id) => !this.hiddenColumns.has(id));
		if (visibleColumns.length > 0) {
			this.renderColumnDropIndicator(
				boardEl,
				visibleColumns[visibleColumns.length - 1],
				'after'
			);
		}
	}

	private renderColumnDropIndicator(boardEl: HTMLElement, columnId: string, position: 'before' | 'after'): void {
		const indicator = boardEl.createDiv('kanban-column-drop-indicator');
		indicator.setAttribute('data-column-id', columnId);
		indicator.setAttribute('data-position', position);

		indicator.addEventListener('dragover', (e: DragEvent) => {
			const dragData = e.dataTransfer?.getData('text/plain');
			if (dragData?.startsWith('column:') && this.draggedColumnId && this.draggedColumnId !== columnId) {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'move';
				}
				indicator.addClass('kanban-column-drop-indicator--active');
			}
		});

		indicator.addEventListener('dragleave', () => {
			indicator.removeClass('kanban-column-drop-indicator--active');
		});

		indicator.addEventListener('drop', (e: DragEvent) => {
			e.preventDefault();
			indicator.removeClass('kanban-column-drop-indicator--active');

			const dragData = e.dataTransfer?.getData('text/plain');
			if (dragData?.startsWith('column:') && this.draggedColumnId && this.draggedColumnId !== columnId) {
				this.reorderColumnsRelative(this.draggedColumnId, columnId, position);
			}
		});
	}

	private renderColumn(boardEl: HTMLElement, columnId: string, entries: BasesEntry[]): void {
		if (!boardEl || !columnId || !entries) {
			console.warn('[KanbanBasesView] renderColumn called with invalid arguments', {
				hasBoardEl: !!boardEl,
				columnId,
				hasEntries: !!entries,
			});
			return;
		}

		const columnEl = boardEl.createDiv('kanban-column');
		columnEl.setAttribute('data-column-id', columnId);

		// Render column header
		const headerEl = columnEl.createDiv('kanban-column-header');
		headerEl.draggable = true;
		headerEl.setAttribute('data-column-id', columnId);

		headerEl.addEventListener('dragstart', (e: DragEvent) => {
			this.draggedColumnId = columnId;
			headerEl.addClass('kanban-column-header--dragging');
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', `column:${columnId}`);
			}
		});

		headerEl.addEventListener('dragend', () => {
			headerEl.removeClass('kanban-column-header--dragging');
		});

		headerEl.createDiv('kanban-column-title', (el) => {
			el.setText(columnId);
		});

		headerEl.createDiv('kanban-column-count', (el) => {
			el.setText(`${entries.length}`);
		});

		// Add remove button to hide column
		headerEl.createDiv('kanban-column-remove', (el) => {
			el.setText('×');
			el.addEventListener('click', (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				this.hideColumn(columnId);
			});
		});

		// Render cards container
		const cardsContainer = columnEl.createDiv('kanban-cards-container');

		cardsContainer.addEventListener('dragover', (e: DragEvent) => {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = 'move';
			}
			cardsContainer.addClass('kanban-cards-container--dragover');
		});

		cardsContainer.addEventListener('dragleave', () => {
			cardsContainer.removeClass('kanban-cards-container--dragover');
		});

		cardsContainer.addEventListener('drop', async (e: DragEvent) => {
			e.preventDefault();
			cardsContainer.removeClass('kanban-cards-container--dragover');

			// Extract target column ID from the DOM to ensure we get the correct target
			const targetColumnId = cardsContainer.closest('.kanban-column')?.getAttribute('data-column-id');

			if (this.draggedEntry && this.draggedFromColumnId !== targetColumnId && targetColumnId) {
				await this.updateEntryProperty(this.draggedEntry, targetColumnId);
			}
		});

		// Column reordering handlers
		columnEl.addEventListener('dragover', (e: DragEvent) => {
			const dragData = e.dataTransfer?.getData('text/plain');
			if (dragData?.startsWith('column:') && this.draggedColumnId && this.draggedColumnId !== columnId) {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'move';
				}
				columnEl.addClass('kanban-column--drop-target');
			}
		});

		columnEl.addEventListener('dragleave', () => {
			columnEl.removeClass('kanban-column--drop-target');
		});

		columnEl.addEventListener('drop', async (e: DragEvent) => {
			e.preventDefault();
			columnEl.removeClass('kanban-column--drop-target');

			const dragData = e.dataTransfer?.getData('text/plain');
			if (dragData?.startsWith('column:') && this.draggedColumnId && this.draggedColumnId !== columnId) {
				this.reorderColumns(this.draggedColumnId, columnId);
			}
		});

		// Virtual scrolling for large columns
		const VIRTUAL_SCROLL_THRESHOLD = 30;

		if (entries.length >= VIRTUAL_SCROLL_THRESHOLD) {
			// Clean up old scroller if exists
			if (this.virtualScrollers.has(columnId)) {
				this.virtualScrollers.get(columnId)?.destroy();
			}

			// Create virtual scroller
			const scroller = new VirtualScroller<BasesEntry>({
				container: cardsContainer,
				items: entries,
				itemHeight: 150, // Estimate for card height
				overscan: 3,
				renderItem: (entry: BasesEntry) => {
					const card = document.createElement('div');
					card.className = 'kanban-card';
					card.draggable = true;
					card.setAttribute('data-entry-path', entry.file.path);

					// Add drag handlers
					card.addEventListener('dragstart', (e: DragEvent) => {
						this.draggedEntry = entry;
						this.draggedFromColumnId = columnId;
						card.classList.add('kanban-card--dragging');
						if (e.dataTransfer) {
							e.dataTransfer.effectAllowed = 'move';
							e.dataTransfer.setData('text/plain', entry.file.path);
						}
					});

					card.addEventListener('dragend', () => {
						card.classList.remove('kanban-card--dragging');
						this.draggedEntry = null;
						this.draggedFromColumnId = null;
					});

					// Render only visible properties (in user's configured order)
					if (this.config) {
						const visibleProperties = this.config.getOrder();
						for (const propertyId of visibleProperties) {
							const value = entry.getValue(propertyId);
							if (value) {
								const propEl = card.createDiv('kanban-card-property');
								propEl.createSpan('kanban-card-property-label', (el) => {
									el.setText(this.config!.getDisplayName(propertyId) + ': ');
								});
								const valueEl = propEl.createSpan('kanban-card-property-value');

								// Render value using the value's renderTo method if available
								if (value && typeof value.renderTo === 'function') {
									value.renderTo(valueEl, this.app.renderContext);
								} else {
									valueEl.setText(String(value));
								}
							}
						}
					}

					return card;
				},
				getItemKey: (entry: BasesEntry) => entry.file.path,
			});

			this.virtualScrollers.set(columnId, scroller);
		} else {
			// Normal rendering for smaller columns (use existing renderCard logic)
			for (const entry of entries) {
				this.renderCard(cardsContainer, entry);
			}
		}
	}

	private renderCard(container: HTMLElement, entry: BasesEntry): void {
		if (!container || !entry) {
			console.warn('[KanbanBasesView] renderCard called with invalid arguments', {
				hasContainer: !!container,
				hasEntry: !!entry,
			});
			return;
		}

		const card = container.createDiv({ cls: 'kanban-card' });
		card.draggable = true;
		card.setAttribute('data-entry-path', entry.file.path);

		// dragstart handler
		card.addEventListener('dragstart', (e: DragEvent) => {
			this.draggedEntry = entry;
			this.draggedFromColumnId = (e.target as HTMLElement).closest('.kanban-column')?.getAttribute('data-column-id') || null;
			card.addClass('kanban-card--dragging');
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', entry.file.path);
			}
		});

		// dragend handler
		card.addEventListener('dragend', () => {
			card.removeClass('kanban-card--dragging');
			this.draggedEntry = null;
			this.draggedFromColumnId = null;
		});

		// Render only visible properties (in user's configured order)
		if (this.config) {
			const visibleProperties = this.config.getOrder();
			for (const propId of visibleProperties) {
				const value = entry.getValue(propId);
				if (value) {
					const propEl = card.createDiv('kanban-card-property');
					propEl.createSpan('kanban-card-property-label', (el) => {
						el.setText(this.config!.getDisplayName(propId) + ': ');
					});
					const valueEl = propEl.createSpan('kanban-card-property-value');

					// Render value using the value's renderTo method if available
					if (value && typeof value.renderTo === 'function') {
						value.renderTo(valueEl, this.app.renderContext);
					} else {
						valueEl.setText(String(value));
					}
				}
			}
		}
	}

	private hideColumn(columnId: string): void {
		this.hiddenColumns.add(columnId);
		this.saveColumnOrder();
		this.render();
	}

	private reorderColumns(sourceColumnId: string, targetColumnId: string): void {
		const groupKey = this._getColumnIdKey();

		// Get current column order for this grouping
		let order = this.columnOrderMap.get(groupKey) || [];

		const sourceIndex = order.indexOf(sourceColumnId);
		const targetIndex = order.indexOf(targetColumnId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		// Move source column to target position
		const [moved] = order.splice(sourceIndex, 1);
		order.splice(targetIndex, 0, moved);

		// Save new order
		this.columnOrderMap.set(groupKey, order);
		this.saveColumnOrder();

		// Re-render with new order
		this.render();
	}

	private reorderColumnsRelative(sourceColumnId: string, targetColumnId: string, position: 'before' | 'after'): void {
		const groupKey = this._getColumnIdKey();

		// Get current column order for this grouping
		let order = this.columnOrderMap.get(groupKey) || [];

		const sourceIndex = order.indexOf(sourceColumnId);
		const targetIndex = order.indexOf(targetColumnId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		// Remove source from current position
		const [moved] = order.splice(sourceIndex, 1);

		// Insert at target position
		const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
		order.splice(insertIndex, 0, moved);

		// Save new order
		this.columnOrderMap.set(groupKey, order);
		this.saveColumnOrder();

		// Re-render with new order
		this.render();
	}

	private async updateEntryProperty(entry: BasesEntry, newColumnValue: string): Promise<void> {
		try {
			if (!this.data) {
				console.warn('[KanbanBasesView] Cannot update: missing data');
				return;
			}

			if (!entry || !newColumnValue) {
				console.warn('[KanbanBasesView] Cannot update: missing entry or newColumnValue');
				return;
			}

			console.log('[KanbanBasesView] Updating entry to new column:', {
				entryPath: entry.file.path,
				newColumn: newColumnValue,
			});

			// Note: Since grouping is now handled by Obsidian, we need to update the entry's
			// grouping property. The actual property to update depends on what the user
			// configured in Obsidian's groupBy settings. For now, this is a placeholder.
			// In a real implementation, we'd need to know what property Obsidian is grouping by.

			console.log('[KanbanBasesView] Entry drag-drop update requires grouping property info from Obsidian API');

			// Re-render to reflect any changes
			this.render();
		} catch (error) {
			console.error('[KanbanBasesView] Error updating entry property:', error);
		}
	}

	static getViewOptions(): ViewOption[] {
		const output: ViewOption[] = [
			{
				type: 'text',
				displayName: 'Column order',
				key: 'kanban-columnNames',
				default: 'Backlog,Todo,In Progress,In Review,Done',
				placeholder: 'e.g., Backlog,Todo,In Progress,In Review,Done',
			},
		];
		return output;
	}
}
