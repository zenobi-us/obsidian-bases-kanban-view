import {
	BasesView,
	QueryController,
	ViewOption,
	BasesEntry,
	HoverParent,
	HoverPopover,
} from 'obsidian';
import { VirtualScroller } from '../utils/VirtualScroller';
import { CardRenderer } from '../utils/CardRenderer';

export class KanbanBasesView extends BasesView implements HoverParent {
	public hoverPopover: HoverPopover | null = null;
	private containerEl: HTMLElement;
	private draggedEntry: BasesEntry | null = null;
	private draggedFromColumnId: string | null = null;
	private draggedColumnId: string | null = null;
	private columnOrderMap: Map<string, string[]> = new Map();
	private isDragging: boolean = false;
	private queryController: QueryController;

	private virtualScrollers: Map<string, VirtualScroller<BasesEntry>> = new Map();
	private cardRenderer: CardRenderer | null = null;

	readonly type = 'kanban';

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.queryController = controller;
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
				}
			}
		}
	}

	private saveColumnOrder(): void {
		// Save column order to config
		if (this.config) {
			const data = Object.fromEntries(this.columnOrderMap);
			this.config.set('kanban-columnOrder', JSON.stringify(data));
			
			// Also update kanban-columnNames with the new order
			const groupKey = this._getColumnIdKey();
			const columnOrder = this.columnOrderMap.get(groupKey) || [];
			if (columnOrder.length > 0) {
				this.config.set('kanban-columnNames', columnOrder.join(','));
			}
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

		// Initialize CardRenderer for tiered field rendering
		try {
			this.cardRenderer = new CardRenderer({
				queryController: this.queryController,
				queryResult: this.data,
				allProperties: this.data.properties || [],
			}, this.app);
		} catch (error) {
			console.warn('[KanbanBasesView] Failed to initialize CardRenderer:', error);
			this.cardRenderer = null;
		}

		this.renderBoard();
	}

	private loadConfig(): void {
		if (this.config) {
			// Grouping config is no longer needed - it's handled by Obsidian's groupedData
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
			const entries = groupedEntries.get(columnId) || [];

			// Render the column
			this.renderColumn(boardEl, columnId, entries);
		}
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

		// Column dragover handler - shows visual feedback for column reordering
		columnEl.addEventListener('dragover', (e: DragEvent) => {
			// Use draggedColumnId to detect column drags (cannot read dataTransfer during drag due to browser security)
			if (this.draggedColumnId && this.draggedColumnId !== columnId) {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'move';
				}
				
				// Detect which half of the column is being hovered
				const rect = columnEl.getBoundingClientRect();
				const midpoint = rect.left + rect.width / 2;
				const isLeftHalf = e.clientX < midpoint;
				
				// Remove both classes first
				columnEl.removeClass('kanban-column--drop-target-left');
				columnEl.removeClass('kanban-column--drop-target-right');
				
				// Add appropriate class based on which half
				if (isLeftHalf) {
					columnEl.addClass('kanban-column--drop-target-left');
				} else {
					columnEl.addClass('kanban-column--drop-target-right');
				}
			}
		});

		columnEl.addEventListener('dragleave', () => {
			// Only remove classes if we're leaving the column entirely (not to a child)
			columnEl.removeClass('kanban-column--drop-target-left');
			columnEl.removeClass('kanban-column--drop-target-right');
		});

		columnEl.addEventListener('drop', async (e: DragEvent) => {
			if (this.draggedColumnId && this.draggedColumnId !== columnId) {
				e.preventDefault();
				columnEl.removeClass('kanban-column--drop-target-left');
				columnEl.removeClass('kanban-column--drop-target-right');
				
				// Detect which half to determine position
				const rect = columnEl.getBoundingClientRect();
				const midpoint = rect.left + rect.width / 2;
				const isLeftHalf = e.clientX < midpoint;
				const position = isLeftHalf ? 'before' : 'after';
				
				this.reorderColumnsRelative(this.draggedColumnId, columnId, position);
			}
		});

		// Render column header
		const headerEl = columnEl.createDiv('kanban-column-header');
		headerEl.draggable = true;
		headerEl.setAttribute('data-column-id', columnId);

		// Setup mousemove tracking for visual feedback during drag
		const handleMouseMove = (moveEvent: MouseEvent) => {
			const elemAtPoint = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
			const targetColumn = elemAtPoint?.closest('[data-column-id]') as HTMLElement | null;
			const targetColumnId = targetColumn?.getAttribute('data-column-id');

			// Remove visual feedback from all columns
			const boardEl = columnEl.closest('.kanban-board');
			if (boardEl) {
				const allColumns = boardEl.querySelectorAll('[data-column-id]');
				allColumns.forEach((col) => {
					col.classList.remove('kanban-column--drop-target-left');
					col.classList.remove('kanban-column--drop-target-right');
				});
			}

			// Add visual feedback to the target column
			if (targetColumnId && targetColumnId !== columnId && targetColumn) {
				const targetRect = targetColumn.getBoundingClientRect();
				const midpoint = targetRect.left + targetRect.width / 2;
				const isLeftHalf = moveEvent.clientX < midpoint;

				if (isLeftHalf) {
					targetColumn.classList.add('kanban-column--drop-target-left');
				} else {
					targetColumn.classList.add('kanban-column--drop-target-right');
				}
			}
		};

		headerEl.addEventListener('dragstart', (e: DragEvent) => {
			this.draggedColumnId = columnId;
			headerEl.addClass('kanban-column-header--dragging');
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', `column:${columnId}`);
			}

			// Start tracking mousemove during drag
			document.addEventListener('mousemove', handleMouseMove);
		});

		headerEl.addEventListener('dragend', (e: DragEvent) => {
			// Stop tracking mousemove
			document.removeEventListener('mousemove', handleMouseMove);
			
			headerEl.removeClass('kanban-column-header--dragging');

			// Clean up visual feedback from all columns
			const boardEl = columnEl.closest('.kanban-board');
			if (boardEl) {
				const allColumns = boardEl.querySelectorAll('[data-column-id]');
				allColumns.forEach((col) => {
					col.classList.remove('kanban-column--drop-target-left');
					col.classList.remove('kanban-column--drop-target-right');
				});
			}

			// Handle column reordering
			if (this.draggedColumnId && this.draggedColumnId !== columnId) {
				const elemAtPoint = document.elementFromPoint(e.clientX, e.clientY);
				const targetColumn = elemAtPoint?.closest('[data-column-id]') as HTMLElement | null;
				const targetColumnId = targetColumn?.getAttribute('data-column-id');

				if (targetColumnId && targetColumnId !== this.draggedColumnId && targetColumn) {
					// Calculate position based on where we released
					const targetRect = targetColumn.getBoundingClientRect();
					const midpoint = targetRect.left + targetRect.width / 2;
					const isLeftHalf = e.clientX < midpoint;
					const position = isLeftHalf ? 'before' : 'after';

					this.reorderColumnsRelative(this.draggedColumnId, targetColumnId, position);
				}
			}

			this.draggedColumnId = null;
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
			// Handle both card and column drags
			if (this.draggedEntry || this.draggedColumnId) {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'move';
				}
				// Only show cards-container feedback for card drags
				if (this.draggedEntry && !this.draggedColumnId) {
					cardsContainer.addClass('kanban-cards-container--dragover');
				}
			}
		});

		cardsContainer.addEventListener('dragleave', () => {
			cardsContainer.removeClass('kanban-cards-container--dragover');
		});

		cardsContainer.addEventListener('drop', async (e: DragEvent) => {
			// If this is a column drag, don't handle it here - let it bubble to columnEl
			if (this.draggedColumnId) {
				// Don't preventDefault, let it bubble
				return;
			}

			// Handle card drops only
			if (this.draggedEntry) {
				e.preventDefault();
				cardsContainer.removeClass('kanban-cards-container--dragover');

				// Extract target column ID from the DOM to ensure we get the correct target
				const targetColumnId = cardsContainer.closest('.kanban-column')?.getAttribute('data-column-id');

				if (this.draggedEntry && this.draggedFromColumnId !== targetColumnId && targetColumnId) {
					await this.updateEntryProperty(this.draggedEntry, targetColumnId);
				}
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
					this.isDragging = true;
					this.draggedEntry = entry;
					this.draggedFromColumnId = columnId;
					card.classList.add('kanban-card--dragging');
					if (e.dataTransfer) {
						e.dataTransfer.effectAllowed = 'move';
						e.dataTransfer.setData('text/plain', entry.file.path);
					}
				});

				card.addEventListener('dragend', () => {
					this.isDragging = false;
					card.classList.remove('kanban-card--dragging');
					this.draggedEntry = null;
					this.draggedFromColumnId = null;
				});

				// Add click handler
				card.addEventListener('click', (e: MouseEvent) => {
					this._handleCardClick(e);
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
		this.isDragging = true;
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
		this.isDragging = false;
		card.removeClass('kanban-card--dragging');
		this.draggedEntry = null;
		this.draggedFromColumnId = null;
	});

	// click handler
	card.addEventListener('click', (e: MouseEvent) => {
		this._handleCardClick(e);
	});

		// Render card content using CardRenderer for tiered field rendering
		if (this.cardRenderer) {
			try {
				const renderedCard = this.cardRenderer.render(entry);
				// Append the tiered card content to the card element
				const childCount = renderedCard.children.length;
				for (let i = 0; i < childCount; i++) {
					const child = renderedCard.children[i];
					if (child) {
						card.appendChild(child);
					}
				}
			} catch (error) {
				console.warn('[KanbanBasesView] CardRenderer failed, falling back to basic rendering:', error);
				this._renderCardFallback(card, entry);
			}
		} else {
			// Fallback if CardRenderer not initialized
			this._renderCardFallback(card, entry);
		}
	}

	/**
	 * Fallback card rendering when CardRenderer is not available.
	 * Renders only visible properties in user's configured order.
	 */
	private _renderCardFallback(card: HTMLElement, entry: BasesEntry): void {
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

	private _handleCardClick(event: MouseEvent): void {
		try {
			const cardElement = (event.target as HTMLElement).closest('.kanban-card');
			if (!cardElement) {
				console.debug('[KanbanBasesView] Click target is not a card element');
				return;
			}

			// Prevent opening if dragging is in progress
			if (this.isDragging) {
				console.debug('[KanbanBasesView] Drag in progress, preventing card open');
				return;
			}

			// Extract record identifier from card data attribute
			const recordId = cardElement.getAttribute('data-entry-path');
			if (!recordId) {
				console.warn('[KanbanBasesView] Card element missing data-entry-path attribute');
				return;
			}

			console.debug(`[KanbanBasesView] Opening record: ${recordId}`);

			// Use Obsidian workspace API to open the record
			this.app.workspace.openLinkText(recordId, '', false);

		} catch (error) {
			console.warn('[KanbanBasesView] Error opening record:', error);
		}
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
