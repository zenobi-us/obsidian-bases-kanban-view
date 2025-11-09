import { Plugin } from 'obsidian';
import { KanbanBasesView } from './views/KanbanBasesView';
import kanbanStyles from './styles/kanban.css?raw';

const KANBAN_VIEW_TYPE = 'kanban';

export default class KanbanBasesViewPlugin extends Plugin {
	async onload() {
		// Inject styles into document head
		const styleEl = document.createElement('style');
		styleEl.textContent = kanbanStyles;
		styleEl.id = 'kanban-bases-styles';
		document.head.appendChild(styleEl);

		this.registerBasesView(KANBAN_VIEW_TYPE, {
			name: 'Kanban',
			icon: 'layout-grid',
			factory: (controller, containerEl) => new KanbanBasesView(controller, containerEl),
			options: KanbanBasesView.getViewOptions
		});

		console.log('KanbanBasesViewPlugin loaded');
	}

	onunload() {
		console.log('KanbanBasesViewPlugin unloaded');
	}
}
