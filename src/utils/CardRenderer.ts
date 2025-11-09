import { App, BasesEntry, BasesPropertyId, BasesQueryResult, QueryController } from 'obsidian';

/**
 * Configuration needed by CardRenderer to function.
 * This includes access to the data and controller.
 */
export interface CardRendererConfig {
	queryController: QueryController;
	queryResult: BasesQueryResult;
	allProperties: BasesPropertyId[];
}

/**
 * CardRenderer handles intelligent, tiered rendering of kanban card properties.
 * 
 * Tier System:
 * - Tier 1 (Critical): Title, status, priority, assignee, due date
 * - Tier 2 (Context): Effort, progress, linked items, description
 * - Tier 3 (Metadata): Tags, custom fields, timestamps
 */
export class CardRenderer {
	private queryController: QueryController;
	private queryResult: BasesQueryResult;
	private allProperties: BasesPropertyId[];
	private app: App;

	/**
	 * Initialize CardRenderer with configuration and Obsidian app instance.
	 * 
	 * @param config - CardRendererConfig containing query controller, result, and properties
	 * @param app - Obsidian App instance for accessing API utilities
	 * @throws Error if config or app are null/undefined
	 */
	constructor(config: CardRendererConfig, app: App) {
		if (!config) {
			throw new Error('CardRenderer: config is required');
		}
		if (!config.queryController) {
			throw new Error('CardRenderer: config.queryController is required');
		}
		if (!config.queryResult) {
			throw new Error('CardRenderer: config.queryResult is required');
		}
		if (!app) {
			throw new Error('CardRenderer: app is required');
		}

		this.queryController = config.queryController;
		this.queryResult = config.queryResult;
		this.allProperties = config.allProperties || [];
		this.app = app;

		console.debug('[CardRenderer] Initialized with query controller and result');
	}

	/**
	 * Render a complete card with all tiers applied intelligently.
	 * 
	 * Coordinates rendering across Tier 1, 2, and 3 fields with smart space allocation.
	 * 
	 * @param entry - BasesEntry to render
	 * @returns HTMLElement representing the complete card
	 */
	public render(entry: BasesEntry): HTMLElement {
		if (!entry) {
			console.warn('[CardRenderer.render] Entry is null/undefined');
			return this._createEmptyCard();
		}

		const cardEl = document.createElement('div');
		cardEl.className = 'kanban-card';

		// Render tiers sequentially
		const tier1El = this.renderTier1(entry);
		const tier2El = this.renderTier2(entry);
		const tier3El = this.renderTier3(entry);

		if (tier1El && tier1El.children.length > 0) cardEl.appendChild(tier1El);
		if (tier2El && tier2El.children.length > 0) cardEl.appendChild(tier2El);
		if (tier3El && tier3El.children.length > 0) cardEl.appendChild(tier3El);

		return cardEl;
	}

	/**
	 * Render Tier 1 (Critical Information) fields.
	 * 
	 * Tier 1 properties: title, status, priority, assignee, due date
	 * Rendering priority: Always render at full prominence
	 * 
	 * @param entry - BasesEntry to render
	 * @returns HTMLElement containing Tier 1 fields, or empty if no Tier 1 properties
	 */
	public renderTier1(entry: BasesEntry): HTMLElement {
		if (!entry) {
			console.warn('[CardRenderer.renderTier1] Entry is null/undefined');
			return document.createElement('div');
		}

		const tier1Fields = this._getTier1Fields();
		const containerEl = document.createElement('div');
		containerEl.className = 'kanban-card-tier-1';

		for (const fieldId of tier1Fields) {
			const fieldEl = this._renderField(entry, fieldId, 'tier-1');
			if (fieldEl) {
				containerEl.appendChild(fieldEl);
			}
		}

		return containerEl;
	}

	/**
	 * Render Tier 2 (Important Context) fields.
	 * 
	 * Tier 2 properties: effort, progress, linked items, description
	 * Rendering priority: Render if space available
	 * 
	 * @param entry - BasesEntry to render
	 * @returns HTMLElement containing Tier 2 fields, or empty if no Tier 2 properties
	 */
	public renderTier2(entry: BasesEntry): HTMLElement {
		if (!entry) {
			console.warn('[CardRenderer.renderTier2] Entry is null/undefined');
			return document.createElement('div');
		}

		const tier2Fields = this._getTier2Fields();
		const containerEl = document.createElement('div');
		containerEl.className = 'kanban-card-tier-2';

		for (const fieldId of tier2Fields) {
			const fieldEl = this._renderField(entry, fieldId, 'tier-2');
			if (fieldEl) {
				containerEl.appendChild(fieldEl);
			}
		}

		return containerEl;
	}

	/**
	 * Render Tier 3 (Additional Details) fields.
	 * 
	 * Tier 3 properties: tags, custom fields, timestamps
	 * Rendering priority: Render only if space remains
	 * 
	 * @param entry - BasesEntry to render
	 * @returns HTMLElement containing Tier 3 fields, or empty if no Tier 3 properties
	 */
	public renderTier3(entry: BasesEntry): HTMLElement {
		if (!entry) {
			console.warn('[CardRenderer.renderTier3] Entry is null/undefined');
			return document.createElement('div');
		}

		const tier3Fields = this._getTier3Fields();
		const containerEl = document.createElement('div');
		containerEl.className = 'kanban-card-tier-3';

		for (const fieldId of tier3Fields) {
			const fieldEl = this._renderField(entry, fieldId, 'tier-3');
			if (fieldEl) {
				containerEl.appendChild(fieldEl);
			}
		}

		return containerEl;
	}

	/**
	 * Get Tier 1 property IDs from the visible properties.
	 * 
	 * Tier 1: Critical information (title, status, priority, assignee, due date)
	 * 
	 * @returns Array of BasesPropertyId in Tier 1
	 */
	private _getTier1Fields(): BasesPropertyId[] {
		if (!this.queryResult || !this.queryResult.properties) {
			return [];
		}

		// Tier 1 property name patterns and their expected types
		const tier1Patterns = [
			/^title$/i,
			/^name$/i,
			/^status$/i,
			/^priority$/i,
			/^assignee$/i,
			/^assigned to$/i,
			/^due date$/i,
			/^duedate$/i
		];

		const result: BasesPropertyId[] = [];

		for (const propertyId of this.queryResult.properties) {
			// Extract the property name from the ID (format is "type.name")
			const propName = this._extractPropertyName(propertyId);

			// Check if name matches Tier 1 patterns
			for (const pattern of tier1Patterns) {
				if (pattern.test(propName)) {
					result.push(propertyId);
					break;
				}
			}
		}

		return result;
	}

	/**
	 * Get Tier 2 property IDs from the visible properties.
	 * 
	 * Tier 2: Important context (effort, progress, linked items, description)
	 * 
	 * @returns Array of BasesPropertyId in Tier 2
	 */
	private _getTier2Fields(): BasesPropertyId[] {
		if (!this.queryResult || !this.queryResult.properties) {
			return [];
		}

		// Tier 2 property name patterns
		const tier2Patterns = [
			/^effort$/i,
			/^points$/i,
			/^story points$/i,
			/^estimate$/i,
			/^progress$/i,
			/^completion$/i,
			/^linked items$/i,
			/^linked$/i,
			/^relations$/i,
			/^description$/i,
			/^details$/i,
			/^notes$/i
		];

		const result: BasesPropertyId[] = [];
		const tier1Ids = new Set(this._getTier1Fields());

		for (const propertyId of this.queryResult.properties) {
			// Skip if already in Tier 1
			if (tier1Ids.has(propertyId)) continue;

			// Extract the property name from the ID
			const propName = this._extractPropertyName(propertyId);

			// Check if name matches Tier 2 patterns
			for (const pattern of tier2Patterns) {
				if (pattern.test(propName)) {
					result.push(propertyId);
					break;
				}
			}
		}

		return result;
	}

	/**
	 * Get Tier 3 property IDs from the visible properties.
	 * 
	 * Tier 3: Additional details (tags, custom fields, timestamps)
	 * All other properties not in Tier 1 or Tier 2 default to Tier 3.
	 * 
	 * @returns Array of BasesPropertyId in Tier 3
	 */
	private _getTier3Fields(): BasesPropertyId[] {
		if (!this.queryResult || !this.queryResult.properties) {
			return [];
		}

		// Get all Tier 1 and Tier 2 property IDs
		const tier1Ids = new Set(this._getTier1Fields());
		const tier2Ids = new Set(this._getTier2Fields());

		// All remaining properties are Tier 3
		const result: BasesPropertyId[] = [];

		for (const propertyId of this.queryResult.properties) {
			// Only add if not already in Tier 1 or Tier 2
			if (!tier1Ids.has(propertyId) && !tier2Ids.has(propertyId)) {
				result.push(propertyId);
			}
		}

		return result;
	}

	/**
	 * Detect the type of a property value.
	 * 
	 * Supports: text, checkbox, multiselect, select, date, time, datetime,
	 *           number, currency, relation, relation-count
	 * 
	 * @param value - The property value to detect
	 * @returns String representing the detected property type, defaults to 'text'
	 */
	private _detectPropertyType(value: any): string {
		// Null/undefined check
		if (value === null || value === undefined) {
			return 'text';
		}

		// Check if value is already a string representing a type
		if (typeof value === 'string') {
			const lowerVal = value.toLowerCase();
			// If it looks like a property type name, return it
			if (['text', 'checkbox', 'select', 'multiselect', 'date', 'time', 'datetime', 'number', 'currency', 'relation', 'relation-count'].includes(lowerVal)) {
				return lowerVal;
			}
		}

		// Structural type detection based on JavaScript type
		if (typeof value === 'boolean') {
			return 'checkbox';
		}

		if (typeof value === 'number') {
			return 'number';
		}

		if (value instanceof Date) {
			return 'date';
		}

		if (Array.isArray(value)) {
			// Array of objects likely relation or multiselect
			if (value.length > 0 && typeof value[0] === 'object') {
				return 'relation';
			}
			return 'multiselect';
		}

		if (typeof value === 'string') {
			// ISO date detection
			if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
				return 'date';
			}
			// ISO datetime detection
			if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
				return 'datetime';
			}
			// Time detection
			if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
				return 'time';
			}
			// Currency detection (simple heuristic)
			if (/^\$|^£|^€|^¥/.test(value) || /\$\d+\.?\d*$/.test(value)) {
				return 'currency';
			}
			return 'text';
		}

		if (typeof value === 'object') {
			// Generic object, likely relation
			return 'relation';
		}

		// Default fallback
		return 'text';
	}

	/**
	 * Find a property in the visible properties by type.
	 * 
	 * @param type - Property type to find (e.g., 'text', 'date', 'select')
	 * @returns First matching BasesPropertyId, or null if not found
	 */
	private _findPropertyByType(type: string): BasesPropertyId | null {
		if (!this.queryResult || !this.queryResult.properties) {
			return null;
		}

		for (const propertyId of this.queryResult.properties) {
			// Try to get the value type from a sample entry
			if (this.queryResult.data && this.queryResult.data.length > 0) {
				const sampleEntry = this.queryResult.data[0];
				const value = sampleEntry.getValue(propertyId);
				const detectedType = this._detectPropertyType(value);

				if (detectedType === type.toLowerCase()) {
					return propertyId;
				}
			}
		}

		return null;
	}

	/**
	 * Extract the property name from a BasesPropertyId.
	 * 
	 * BasesPropertyId format is "type.name", e.g., "note.title" or "formula.customField"
	 * 
	 * @param propertyId - The property ID to extract name from
	 * @returns The property name part of the ID
	 */
	private _extractPropertyName(propertyId: BasesPropertyId): string {
		if (!propertyId) return '';

		// Split on the first dot to extract the name part
		const parts = propertyId.split('.');
		if (parts.length >= 2) {
			// Join remaining parts in case name contains dots
			return parts.slice(1).join('.');
		}

		return propertyId;
	}

	/**
	 * Render a single field with appropriate formatting for its tier.
	 * 
	 * @param entry - BasesEntry containing the property
	 * @param fieldId - BasesPropertyId to render
	 * @param tierClass - CSS class indicating tier (tier-1, tier-2, tier-3)
	 * @returns HTMLElement representing the field, or null if field not found
	 */
	private _renderField(entry: BasesEntry, fieldId: BasesPropertyId, tierClass: string): HTMLElement | null {
		if (!entry || !fieldId) {
			return null;
		}

		const value = entry.getValue(fieldId);
		if (value === null || value === undefined) {
			return null;
		}

		const fieldEl = document.createElement('div');
		fieldEl.className = `kanban-field ${tierClass}`;
		fieldEl.setAttribute('data-property-id', fieldId);

		// Extract property name for label
		const propName = this._extractPropertyName(fieldId);

		// Create label if property name is available
		if (propName) {
			const label = document.createElement('span');
			label.className = 'kanban-field-label';
			label.textContent = propName;
			fieldEl.appendChild(label);
		}

		// Create value display
		const valueEl = document.createElement('span');
		valueEl.className = 'kanban-field-value';

		// Format value based on type
		const valueStr = this._formatPropertyValue(value);
		valueEl.textContent = valueStr;

		fieldEl.appendChild(valueEl);

		return fieldEl;
	}

	/**
	 * Format a property value for display.
	 * 
	 * @param value - The value to format
	 * @returns String representation of the value
	 */
	private _formatPropertyValue(value: any): string {
		if (value === null || value === undefined) {
			return '';
		}

		if (Array.isArray(value)) {
			// Join array items with commas
			return value.map(v => String(v)).join(', ');
		}

		if (value instanceof Date) {
			// Format date
			return value.toLocaleDateString();
		}

		if (typeof value === 'object') {
			// For objects, try to get a useful string representation
			if (value.name) return value.name;
			if (value.title) return value.title;
			return JSON.stringify(value);
		}

		return String(value);
	}

	/**
	 * Create an empty card placeholder when rendering fails.
	 * 
	 * @returns HTMLElement representing an empty card state
	 */
	private _createEmptyCard(): HTMLElement {
		const cardEl = document.createElement('div');
		cardEl.className = 'kanban-card kanban-card-empty';
		return cardEl;
	} 
}
