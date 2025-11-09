import {
	BasesView,
	QueryController,
	ViewOption,
	BasesEntry,
	BasesPropertyId,
	HoverParent,
	HoverPopover,
} from 'obsidian';

export class KanbanBasesView extends BasesView implements HoverParent {
	public hoverPopover: HoverPopover | null = null;
	private groupByPropertyId: BasesPropertyId = 'status' as BasesPropertyId;
	private containerEl: HTMLElement;

	readonly type = 'kanban';

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv('kanban-bases-view-container');
	}

	onload(): void {
		// Stub for now
	}

	onunload(): void {
		if (this.hoverPopover) {
			this.hoverPopover.unload();
			this.hoverPopover = null;
		}
	}

	onDataUpdated(): void {
		this.loadConfig();
		this.render();
	}

	private render(): void {
		this.containerEl.empty();

		if (!this.config) {
			this.renderNoGroupingError();
			return;
		}

		if (!this.data || !this.data.data || this.data.data.length === 0) {
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
	}

	private groupEntries(): Map<string, BasesEntry[]> {
		const grouped = new Map<string, BasesEntry[]>();

		if (!this.data || !this.data.data) {
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
		const errorEl = this.containerEl.createDiv('kanban-error');
		errorEl.createDiv('kanban-error-message', (el) => {
			el.setText('No grouping property configured. Please select a property to group by.');
		});
	}

	private renderEmptyState(): void {
		const emptyEl = this.containerEl.createDiv('kanban-empty');
		emptyEl.createDiv('kanban-empty-message', (el) => {
			el.setText('No entries to display');
		});
	}

	private renderBoard(): void {
		const boardEl = this.containerEl.createDiv('kanban-board');
		const grouped = this.groupEntries();

		for (const [columnId, entries] of grouped) {
			this.renderColumn(boardEl, columnId, entries);
		}
	}

	private renderColumn(boardEl: HTMLElement, columnId: string, entries: BasesEntry[]): void {
		const columnEl = boardEl.createDiv('kanban-column');

		// Render column header
		const headerEl = columnEl.createDiv('kanban-column-header');
		headerEl.createDiv('kanban-column-title', (el) => {
			el.setText(columnId);
		});
		headerEl.createDiv('kanban-column-count', (el) => {
			el.setText(`${entries.length}`);
		});

		// Render cards container
		const cardsContainer = columnEl.createDiv('kanban-cards-container');

		for (const entry of entries) {
			this.renderCard(cardsContainer, entry);
		}
	}

	private renderCard(container: HTMLElement, entry: BasesEntry): void {
		const cardEl = container.createDiv('kanban-card');

		// Iterate through all visible properties and render them
		if (this.config && this.allProperties) {
			for (const propId of this.allProperties) {
				const value = entry.getValue(propId);
				if (value) {
					const propEl = cardEl.createDiv('kanban-card-property');
					propEl.createSpan('kanban-card-property-label', (el) => {
						el.setText(this.config.getDisplayName(propId) + ': ');
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

	static getViewOptions(): (() => ViewOption[]) {
		return () => [
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
