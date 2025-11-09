import { Plugin, PluginSettingTab, App, Setting } from 'obsidian';

interface KanbanBasesSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: KanbanBasesSettings = {
	mySetting: 'default'
}

export default class KanbanBasesPlugin extends Plugin {
	settings: KanbanBasesSettings;

	async onload() {
		await this.loadSettings();

		// Register the kanban view
		this.registerView(
			'kanban',
			(leaf) => new KanbanView(leaf)
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('layout-grid', 'Kanban View', (evt: MouseEvent) => {
			this.activateView();
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType('kanban')[0];

		if (!leaf) {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: 'kanban', active: true });
		}

		workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class KanbanView {
	constructor(leaf: any) {
		this.leaf = leaf;
	}

	private leaf: any;

	getViewType() {
		return 'kanban';
	}

	getDisplayText() {
		return 'Kanban';
	}

	getIcon() {
		return 'layout-grid';
	}

	async onOpen() {
		const container = this.leaf.containerEl.children[1];
		container.empty();
		container.createEl('h4', { text: 'Kanban View' });
	}

	async onClose() {
		// Nothing to clean up.
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: KanbanBasesPlugin;

	constructor(app: App, plugin: KanbanBasesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
