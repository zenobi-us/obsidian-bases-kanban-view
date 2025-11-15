import { Plugin, ViewOption } from 'obsidian';
import { KanbanBasesView } from './views/KanbanBasesView';
import globalStyles from './styles/global.css?raw';

const KANBAN_VIEW_TYPE = 'kanban';

export default class KanbanBasesViewPlugin extends Plugin {

	async onload() {
		// Inject global styles into document head
		const styleEl = document.createElement('style');
		styleEl.textContent = globalStyles;
		styleEl.id = 'kanban-global-styles';
		document.head.appendChild(styleEl);

		this.registerBasesView(KANBAN_VIEW_TYPE, {
			name: 'Kanban',
			icon: 'layout-grid',
			factory: (controller, containerEl) => new KanbanBasesView(controller, containerEl),
			options: KanbanBasesView.getViewOptions,
		});

		console.log('KanbanBasesViewPlugin loaded');
	}

	onunload() {
		console.log('KanbanBasesViewPlugin unloaded');
	}
}
