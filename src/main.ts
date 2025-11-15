import { Plugin, ViewOption } from 'obsidian';
import { KanbanBasesView } from './views/KanbanBasesView';
import globalStyles from './styles/global.css?raw';

const KANBAN_VIEW_TYPE = 'kanban';

export default class KanbanBasesViewPlugin extends Plugin {

	async onload() {
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
