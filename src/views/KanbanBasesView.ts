import {
	BasesView,
	QueryController,
	ViewOption,
	BasesEntry,
	BasesPropertyId,
	HoverParent,
	HoverPopover,
} from 'obsidian';
import { VirtualScroller } from '../utils/VirtualScroller';

export class KanbanBasesView extends BasesView implements HoverParent {
	public hoverPopover: HoverPopover | null = null;
	private groupByPropertyId: BasesPropertyId = 'status' as BasesPropertyId;
	private containerEl: HTMLElement;
	private draggedEntry: BasesEntry | null = null;
	private draggedFromColumnId: string | null = null;
	private draggedColumnId: string | null = null;
	private columnOrderMap: Map<string, string[]> = new Map();
	private virtualScrollers: Map<string, VirtualScroller<BasesEntry>> = new Map();

	readonly type = 'kanban';

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv('kanban-bases-view-container');
	}

	private loadColumnOrder(): void {
		const key = `kanban-column-order`;
		const stored = localStorage.getItem(key);
		if (stored) {
			try {
				const data = JSON.parse(stored);
				this.columnOrderMap = new Map(Object.entries(data));
			} catch (e) {
				console.warn('Failed to load column order:', e);
			}
		}
	}

	private saveColumnOrder(): void {
		const key = `kanban-column-order`;
		const data = Object.fromEntries(this.columnOrderMap);
		localStorage.setItem(key, JSON.stringify(data));
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
		console.debug('[KanbanBasesView] Rendering board', {
			hasData: !!this.data,
			hasGroupingProperty: !!this.groupByPropertyId,
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

		if (!this.data.data || this.data.data.length === 0) {
			this.renderEmptyState();
			return;
		}

		this.renderBoard();
	}

	private loadConfig(): void {
		if (this.config) {
			const configValue = this.config.get('groupByPropertyId');
			this.groupByPropertyId = (configValue as BasesPropertyId) || ('status' as BasesPropertyId);
		}
		this.loadColumnOrder();
	}

	private groupEntries(): Map<string, BasesEntry[]> {
		const grouped = new Map<string, BasesEntry[]>();

		if (!this.data || !this.data.data) {
			console.warn('[KanbanBasesView] groupEntries called but data is missing');
			return grouped;
		}

		if (!this.groupByPropertyId) {
			console.warn('[KanbanBasesView] groupEntries called but groupByPropertyId is not set');
			return grouped;
		}

		for (const entry of this.data.data) {
			const value = entry.getValue(this.groupByPropertyId);
			const columnKey = value ? String(value) : 'Ungrouped';

			if (!grouped.has(columnKey)) {
				grouped.set(columnKey, []);
			}
			grouped.get(columnKey)!.push(entry);
		}

		return grouped;
	}

	private renderNoGroupingError(): void {
		if (!this.containerEl) {
			console.error('[KanbanBasesView] Cannot render error: containerEl is null');
			return;
		}
		const errorEl = this.containerEl.createDiv('kanban-error');
		errorEl.createEl('p', {
			text: 'No grouping property configured. Please select a "Group by" property in the view options.',
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

		if (!this.data || !this.data.data) {
			console.warn('[KanbanBasesView] renderBoard called but data is missing');
			return;
		}

		const boardEl = this.containerEl.createDiv('kanban-board');
		const groupedEntries = this.groupEntries();

		if (groupedEntries.size === 0) {
			this.renderEmptyState();
			return;
		}

		// Get all column IDs from grouped data
		const allColumnIds = Array.from(groupedEntries.keys());

		// Initialize or get stored column order for this grouping
		let columnOrder = this.columnOrderMap.get(this.groupByPropertyId || 'default') || [];

		// Add any new columns not yet in order
		let orderChanged = false;
		for (const columnId of allColumnIds) {
			if (!columnOrder.includes(columnId)) {
				columnOrder.push(columnId);
				orderChanged = true;
			}
		}

		// Remove columns that no longer exist
		const initialLength = columnOrder.length;
		columnOrder = columnOrder.filter((id) => allColumnIds.includes(id));
		if (columnOrder.length !== initialLength) {
			orderChanged = true;
		}

		// Save if order changed
		if (orderChanged) {
			this.columnOrderMap.set(this.groupByPropertyId || 'default', columnOrder);
			this.saveColumnOrder();
		}

		// Render columns in saved order with drop indicators between them
		for (let i = 0; i < columnOrder.length; i++) {
			const columnId = columnOrder[i];
			const entries = groupedEntries.get(columnId) || [];
			
			// Render drop indicator before this column
			this.renderColumnDropIndicator(boardEl, columnId, 'before');
			
			// Render the column
			this.renderColumn(boardEl, columnId, entries);
		}
		
		// Final drop indicator after last column
		if (columnOrder.length > 0) {
			this.renderColumnDropIndicator(boardEl, columnOrder[columnOrder.length - 1], 'after');
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

			if (this.draggedEntry && this.draggedFromColumnId !== columnId) {
				await this.updateEntryProperty(this.draggedEntry, columnId);
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

	private reorderColumns(sourceColumnId: string, targetColumnId: string): void {
		if (!this.groupByPropertyId) return;

		// Get current column order for this grouping
		let order = this.columnOrderMap.get(this.groupByPropertyId) || [];

		const sourceIndex = order.indexOf(sourceColumnId);
		const targetIndex = order.indexOf(targetColumnId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		// Move source column to target position
		const [moved] = order.splice(sourceIndex, 1);
		order.splice(targetIndex, 0, moved);

		// Save new order
		this.columnOrderMap.set(this.groupByPropertyId, order);
		this.saveColumnOrder();

		// Re-render with new order
		this.render();
	}

	private reorderColumnsRelative(sourceColumnId: string, targetColumnId: string, position: 'before' | 'after'): void {
		if (!this.groupByPropertyId) return;

		// Get current column order for this grouping
		let order = this.columnOrderMap.get(this.groupByPropertyId) || [];

		const sourceIndex = order.indexOf(sourceColumnId);
		const targetIndex = order.indexOf(targetColumnId);

		if (sourceIndex === -1 || targetIndex === -1) return;

		// Remove source from current position
		const [moved] = order.splice(sourceIndex, 1);

		// Insert at target position
		const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
		order.splice(insertIndex, 0, moved);

		// Save new order
		this.columnOrderMap.set(this.groupByPropertyId, order);
		this.saveColumnOrder();

		// Re-render with new order
		this.render();
	}

	private async updateEntryProperty(entry: BasesEntry, newColumnValue: string): Promise<void> {
		try {
			if (!this.groupByPropertyId || !this.data) {
				console.warn('[KanbanBasesView] Cannot update: missing groupByPropertyId or data');
				return;
			}

			if (!entry || !newColumnValue) {
				console.warn('[KanbanBasesView] Cannot update: missing entry or newColumnValue');
				return;
			}

			console.log('[KanbanBasesView] Updating entry property:', {
				entryPath: entry.file.path,
				propertyId: this.groupByPropertyId,
				newValue: newColumnValue,
			});

			// TODO: Implement actual property update using Obsidian/Bases API
			// Reference: TaskNotes plugin uses app.fileManager.processFrontMatter()
			// or direct property update via Bases controller

			// For now, re-render to handle any updates
			this.render();
		} catch (error) {
			console.error('[KanbanBasesView] Error updating entry property:', error);
		}
	}



	private hasValidProperties(): boolean {
		return this.allProperties && this.allProperties.length > 0 && !!this.config;
	}

	static getViewOptions(): ViewOption[] {
		return [
			{
				type: 'property',
				displayName: 'Group by',
				key: 'groupByPropertyId',
				default: 'status',
				placeholder: 'Property'
			} as unknown as ViewOption
		];
	}
}
