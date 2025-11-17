# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
