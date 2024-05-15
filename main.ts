import { App, Editor, MarkdownView, Modal, Notice, Platform, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
			const rows = source.split("\n").filter((row) => row.length > 0);
			console.log("csv", source, el, ctx);
			const table = el.createEl("table");
			const body = table.createEl("tbody");

			for (let i = 0; i < rows.length; i++) {
				const cols = rows[i].split(",");

				const row = body.createEl("tr");

				for (let j = 0; j < cols.length; j++) {
					row.createEl("td", { text: cols[j] });
				}
			}
		});

		// this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
		// 	console.log("csv",source, el, ctx);

		// });

		console.log("Running on ---------------onload")
		this.registerMarkdownPostProcessor((element, ctx) => {
			// const img = element.querySelectorAll("img");
			// console.log("img:", img)

			// var imgTag = element.getElementsByTagName("img");
			// console.log("imgTag:", imgTag)

			const targetLinks = Array.from(element.getElementsByTagName("img"));

			// const basePath = (this.app.vault.adapter as any).basePath
			// console.log('basePath: ' + basePath)

			for (const link of targetLinks) {
				let clean_link = link.src.replace('app://obsidian.md/', '')

				let imageFile = this.app.metadataCache.getFirstLinkpathDest(clean_link, ctx.sourcePath);
				if (imageFile == null) {
					console.log('imageFile is null')
					continue;
				}
				let active_path = this.app.vault.getResourcePath(imageFile)

				// For iOS
				clean_link = clean_link.replace('capacitor://localhost/', '')
				console.log('clean_link: ' + clean_link)
				let full_link = active_path + '/' + clean_link
				console.log('full_link: ' + full_link)
				link.src = full_link
				if (Platform.isMobile) {
					console.log("Running on mobile platform - setting object fit and height of img")
					link.style.objectFit = "contain"
					link.height = 100
				}
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
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
