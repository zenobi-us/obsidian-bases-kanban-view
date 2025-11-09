# Obsidian Kanban Bases View Plugin

A custom Obsidian Bases view that displays data in a **kanban board layout** with drag-drop support for organizing items across configurable columns.

## Features

✨ **Configurable Grouping** - Group items by any property  
🎨 **Drag-Drop Cards** - Move cards between columns (visual feedback)  
↔️ **Reorder Columns** - Drag column headers to reorganize  
💾 **Persistent Layout** - Column order saved per grouping property  
⚡ **Virtual Scrolling** - Smooth performance with 100+ items  
🎯 **All Properties Displayed** - Shows all visible properties on cards  
🛡️ **Robust Error Handling** - Helpful error messages and debug logging  

## Installation

### Developer Installation

For development, use mise tasks which auto-builds and installs:

```bash
mise run dev
```

This will:
1. Install dependencies (cached with bkt)
2. Configure Obsidian vault path (if first time)
3. Symlink plugin to vault
4. Watch for source changes
5. Auto-rebuild on every change

Then reload Obsidian (Cmd+R on Mac, Ctrl+R on Windows/Linux) to see changes.

## Usage

### Enable the Plugin

1. Go to **Settings** → **Community plugins** → **Installed plugins**
2. Search for **"Kanban"** and enable it
3. No configuration required (uses defaults)

### Open a Base in Kanban View

1. Open a Base file
2. Click the **view selector dropdown** (top-right)
3. Select **"Kanban"**

### Configure Grouping

1. Click the **view options** icon
2. Select **"Group by"** property
3. Board updates automatically

### Drag-Drop Cards

- **Drag cards** between columns to move them
- Visual feedback during drag (opacity + shadow)
- Drop zone highlights on hover
- **Note:** Property updates are logged but not yet persisted (TODO)

### Reorder Columns

- **Drag column headers** to reorder
- Order is saved per grouping property
- Persists across reloads

## Architecture

```
KanbanBasesViewPlugin
├── Registers with Obsidian Bases API
├── Extends BasesView
├── Manual grouping (this.data.data)
├── Drag-drop handlers (cards & columns)
├── Virtual scroller for performance
└── Comprehensive error handling
```

### Key Implementation Details

- **Data Source**: Uses `this.data.data` (flat ungrouped entries)
- **Manual Grouping**: Groups by property value at render time
- **Virtual Scrolling**: Activated for columns with 30+ items
- **Persistence**: Column order saved to localStorage per grouping

undefined

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide including:

- Feature checklist
- Installation verification
- Debugging tips
- Known limitations

## Project Structure

```
.
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── views/
│   │   └── KanbanBasesView.ts  # Main kanban view (523 lines)
│   ├── utils/
│   │   └── VirtualScroller.ts  # Virtual scrolling utility (99 lines)
│   └── styles/
│       └── kanban.css          # Styling (150+ lines)
├── main.js                      # Built plugin (19 KB)
├── manifest.json                # Plugin metadata
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── esbuild.config.mjs           # Build config
├── install-plugin.sh            # Installation helper
├── dev-install.sh               # Development helper
├── TESTING.md                   # Testing guide
└── README.md                    # This file
```

## Git History

```
69d1435 docs: add plugin installation and testing guide
9ec8cd9 refactor: add defensive error handling and improved logging
2bce202 feat(kanban): implement virtual scrolling for large columns
47673bc feat(kanban): implement column reordering with drag-drop and persistence
080345e feat: add card drag-drop between columns
c83b5ef feat: implement KanbanBasesView with manual entry grouping
33aedc8 chore(init): set up project structure for obsidian-kanban-bases plugin
```

## Known Limitations

### TODO: Property Updates
- Card drag-drop between columns shows UI feedback but doesn't persist changes yet
- `updateEntryProperty()` method needs Obsidian/Bases API integration
- Logs to console what would be updated

### Not Yet Implemented
- Swimlanes (2D grouping)
- Filter integration
- Sorting options
- Create/edit items inline
- Keyboard navigation
- Custom card templates

## Next Steps

1. **Test the plugin** - See [TESTING.md](./TESTING.md)
2. **Implement property updates** - Use Obsidian API to persist drag-drop changes
3. **Add swimlanes** - Enable 2D grouping (rows + columns)
4. **Performance testing** - Verify with 1000+ item datasets
5. **Community feedback** - Polish based on user requests

## Debug Console

View plugin logs in Obsidian DevTools:

1. **Mac:** Cmd+Option+I
2. **Windows/Linux:** Ctrl+Shift+I
3. Filter: `[KanbanBasesView]`

## Contributing

For bug reports or feature requests:

1. Test with the current code
2. Note console errors
3. Document steps to reproduce
4. Describe expected vs actual behavior

## License

MIT

---

**Status:** ✅ MVP Complete - Ready for Testing

**Build:** ✅ Clean (19 KB)  
**Tests:** ✅ All 6 core features implemented  
**Installation:** ✅ Ready at `~/.obsidian/plugins/obsidian-kanban-bases/`
