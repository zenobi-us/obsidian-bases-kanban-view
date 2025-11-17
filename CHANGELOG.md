# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0](https://github.com/zenobi-us/obsidian-bases-kanban-view/compare/v1.0.0...v2.0.0) (2025-11-17)


### ⚠ BREAKING CHANGES

* Column state now persists via config.set() instead of localStorage for better portability

### Features

* add automatic column flush when filter changes ([011cf0d](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/011cf0d322d91755b1cabf3e07027eceb13f315f))
* add card drag-drop between columns ([080345e](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/080345e747a52bbd91b7cf861cf5c783efb26214))
* add column order configuration via text field ([d7d033d](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/d7d033d968499e2f8277621ec773c1937bf3d225))
* add CSS loader to esbuild config ([04f3819](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/04f38191618a27d1e89f903dc9c50f800aef59e9))
* add HMR (Hot Module Reload) watcher for development ([631e1c1](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/631e1c1eee9ecf46dc26ec36a3ac5c988badc757))
* add node to mise tools ([2360cf4](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2360cf48cd0467e97fb13649067936b494ce5452))
* add normalize grouping field option for consistent column naming ([76b28de](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/76b28de2dc28e86b648d2bbe2f9f17a82d88fc8f))
* add normalize property value toggle for property mode ([c40d428](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/c40d428f66409b23da70798b454536bc733d4ac1))
* add setup task and switch to pnpm ([ecc6250](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/ecc625006b80078ca4b6995b577bace9eb5144ce))
* add template-based grouping with custom filter transforms ([38f119d](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/38f119dc5620d956fd97a4d108ad062f16a00676))
* **click-handler:** implement core click handling for kanban cards ([2dae950](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2dae9500ba68c8e7d554c5e2cc0c8f2bba38e00d))
* colours ([96362b0](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/96362b0e4b2eff1a311aa3b43490eb923154c43d))
* column filter ([a8a1aee](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/a8a1aee97390e0f78b2f5c578eab3810995c1e88))
* copy manifest.json on build ([e02cdd9](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/e02cdd9645181652b81cb1d67f33bc314def3bcd))
* **data-integration:** wire useKanbanData into GroupingContext for automatic state updates ([d4fa8f7](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/d4fa8f7d0a3a9fe24e2e2f07c4074e66f2fa1b20))
* **drag-drop:** implement moveCard handler for kanban column transitions ([162f20b](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/162f20b7e969b13c32a0132cf4da508ccea61b43))
* draggable columns update configuration ([c294178](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/c294178e46412ff38e05ea65aa5bfd554f5aa062))
* implement KanbanBasesView with manual entry grouping ([c83b5ef](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/c83b5ef9f6b9c2ce819fd416d9f4643f226ff755))
* inject CSS styles into document head on plugin load ([43bd538](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/43bd538128d4a6ebc299d8dc44e9cbafe775443e))
* **kanban:** implement column reordering with drag-drop and persistence ([47673bc](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/47673bc70c6f7fdfe96b50bb7676e47b91311e1d))
* **kanban:** implement virtual scrolling for large columns ([2bce202](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2bce20279d3ec860133dc2ad34d52291b96fb59a))
* **kanban:** integrate CardRenderer for tiered field rendering ([9093ee1](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/9093ee1a48d11a35411ad475f900fa42b08054a2))
* persist column definitions using Obsidian config API to fix column vanishing bug ([07b777a](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/07b777a4fcb6705f06bb0a074dd4e331841a6b17))
* **react:** create component architecture with AppContext and useApp hook ([3da1f52](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/3da1f52bbed26540b367b107636f9cb142b2ef28))
* **react:** create KanbanBoard and Column components with data flow ([b130fe2](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/b130fe20e26708e562acac66fd18467ba833389b))
* **react:** implement Card component with tiered field rendering ([1cde545](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/1cde545ba38064fd6264faa8d087bc6c7158b8ef))
* **react:** implement drag-and-drop with visual feedback ([6626a2a](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/6626a2a2077884c7b3a32008fb69fd8e6daef8c2))
* **react:** implement Obsidian data integration and state management hooks ([2f406d3](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2f406d396d58062c14fd79049fbb6f8811b246ea))
* **react:** implement virtual scrolling integration with TanStack/Virtual ([bcdd360](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/bcdd3607b1b1306066453449c035bac86688efc9))
* **react:** install React 19, TanStack/Virtual, Vitest; configure JSX in tsconfig ([d3dce9f](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/d3dce9f874e3a9887818abe3269085444f3ac88c))
* **react:** integrate React mounting into KanbanBasesView plugin lifecycle ([f8cb5e6](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/f8cb5e6108f7810844bf5b74208770d18f4dd5c8))
* **react:** integrate React rendering into KanbanBasesView ([422a5d2](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/422a5d241b518d71f45b564ecfc89800073314d8))
* **react:** setup React dependencies and configure JSX compilation ([8ab5210](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/8ab52103976c0e79f7fe8dc23735973e77a87dee))
* reafactor to react dnd kit ([7876cfa](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/7876cfaa6957ed3569da0367f01f02484484f696))
* **render:** implement CardRenderer architecture for intelligent tiered field rendering ([3741ef6](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/3741ef6015e8a661c138684a78bb645dc72655c3))
* **test:** setup Vitest configuration and write utility tests ([2b5de13](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2b5de133e5d9a68215480f3b50c4230e4b9fc04c))


### Bug Fixes

* cleanup ([f6240ca](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/f6240ca9c6d98f4c0867ff4b327d14100c2e83ba))
* cleanup ([1ff8fbc](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/1ff8fbc1a741f4e49d2f9a0bb4fe5506f84f6e43))
* **config:** inline view options following Obsidian Bases API pattern ([549a5cd](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/549a5cd4ae3d306f2dbb67697939f45aaaeb3ac7))
* **config:** wrap getViewOptions in callback to expose board config ([9a51389](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/9a5138910c52ce88a2bcaf3d725b9557a59b6461))
* correct registerBasesView options parameter and return type ([014ddf2](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/014ddf232f8ee04b150bf98a0f4763f9a408ca86))
* **drag-drop:** add proper memoization and debugging to useDragAndDropKanban hook ([5e1d758](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/5e1d758f90c98eb5f07a7463d556813ae53da386))
* **drag-drop:** extract frontmatter field name from BasesPropertyId for persistence ([a84aecd](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/a84aecd87e20f87db94268db8499cf8418024b99))
* **drag-drop:** implement moveCard handler to update entry properties via Obsidian API ([97ed9a4](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/97ed9a4951995347b327da5147dd72475ae3d1ad))
* **drag-drop:** show column drag visual indicators by fixing event handler ordering ([3add5e1](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/3add5e18bf7ff13fc687336f9952046e2609a949))
* **drag-drop:** use draggedColumnId instead of dataTransfer for column drag detection ([fb68755](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/fb6875580ec5de7f47c9b9442c0f5a078dcfcb36))
* **drag-overlay:** attach overlay card at grab point instead of center ([d412f88](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/d412f8803a826d27b53cc258d4884edd88bde81e))
* enable noEmit in TypeScript config ([32b6d18](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/32b6d18f61002a6ea6cebb5f4795e9278a38f529))
* identify columns ([7794560](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/7794560d7a64f83d228b95443ee1ab1d094c1deb))
* **kanban:** implement card drag-drop property persistence ([acd0afa](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/acd0afaa740dc2bca69ac763b0a7ac000d25e2ab))
* **kanban:** implement card drag-drop property updates ([26e3f23](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/26e3f2383922a6c6e65a5eb868b90fef4cd68121))
* minor positioning improvements ([7091d7b](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/7091d7b724a4c939a2a136608e67b6045faf6942))
* pkg cleanup ([78ed989](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/78ed989c13985741e01e73b2263b352ebc980e20))
* properly constrain kanban layout to prevent card stacking ([146efff](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/146efffe44e200ca0c86c1185fe749e00ce1a3eb))
* **react:** add React default import to KanbanBoard, TestComponent, and AppContext ([8bdfd23](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/8bdfd23b7bdaedbaab3371bc523df93b0bd6ad9d))
* **react:** add React import to all JSX components ([a2c1386](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/a2c1386bd61378f4a2689fd1dde2789ac5bf9f33))
* **react:** add React import to ReactMountManager for JSX rendering ([5515d15](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/5515d15c15740b6e22fec30eb36a6ffe796b4018))
* **react:** make groupByPropertyId nullable to support rendering without field metadata ([bfd1fd5](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/bfd1fd5e431f78e4482808999e095d76c5491670))
* remove extra wrapper div that broke horizontal column layout ([2420582](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/24205822730363f06a4baf3d8e59c1b0d2f0c7dd))
* remove redunant test ([e839c63](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/e839c63a9bacc15cd943449ca921cf4ad4580e46))
* restore corrupted symlink files ([205f7d5](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/205f7d5625d05fce977a3a934a7d6e3d6856c775))
* restore CSS loader and remove undefined in esbuild config ([0f40f75](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/0f40f75a02dae4cf649623f86affc5f4ae0a397a))
* restore symlink files with correct kebab-case plugin name ([3d592a6](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/3d592a6f21e5d14ea62de19bccce72faf9dfbe01))
* **tests:** update performance test to use current KanbanProvider API ([44a372c](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/44a372c9e8226001323e2bb3bc8a72c61690c2fc))
* **types,build:** add onCardDrop prop to KanbanBoardProps and fix setup.ts ([2164309](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/2164309b2d18c34fe6b531a7227f517b83260717))
* use kebab-case for plugin folder name ([faac542](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/faac5425b2a04eada7ff162a48b0f9c4f2fa3182))
* use local CSS loader instead of text ([b254670](https://github.com/zenobi-us/obsidian-bases-kanban-view/commit/b254670ff86ae9b6919e709b02502832e54dc8f4))

## [1.0.0] - 2025-11-17

### Added
- Initial release of Kanban Bases View plugin
- Configurable grouping by Obsidian Base properties
- Drag-drop card movement between columns
- Column reordering with persistence
- Virtual scrolling for performance with 100+ items
- All properties displayed on cards
- Robust error handling with debug logging

### Features
- ✨ Configurable Grouping - Group items using standard Bases properties
- 🎨 Drag-Drop Cards - Move cards between columns with visual feedback
- ↔️ Reorder Columns - Drag column headers to reorganize
- 💾 Persistent Layout - Column order saved in base view settings
- ⚡ Virtual Scrolling - Smooth performance with 100+ items
- 🎯 All Properties Displayed - Shows all visible properties on cards
- 🛡️ Robust Error Handling - Helpful error messages and debug logging

### Known Limitations
- Property updates from drag-drop not yet persisted to Obsidian Bases API
- No swimlanes (2D grouping) support
- No filter integration
- No sorting options
- No inline create/edit
- No keyboard navigation
- No custom card templates

### Technical Details
- Built with React 19 and Vite
- Drag-drop powered by @dnd-kit
- Virtual scrolling with TanStack Virtual
- TypeScript strict mode enabled
- Comprehensive test coverage
