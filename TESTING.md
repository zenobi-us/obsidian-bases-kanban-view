# Testing the Kanban Bases View Plugin

## Installation

The plugin has been installed to:
```
~/Notes/.obsidian/plugins/obsidian-kanban-bases/
```

## Quick Start

### 1. Enable the Plugin

1. **Reload Obsidian** (Cmd+R on Mac, Ctrl+R on Windows/Linux)
2. Go to **Settings** → **Community plugins** → **Installed plugins**
3. Look for **"Kanban"** (or search for "kanban")
4. Enable the plugin by toggling it ON

### 2. Create or Open a Base

1. Create a new Base file or open an existing one
2. Click the **view selector** dropdown (usually top-right of the view)
3. Select **"Kanban"** from the list of available views

## Testing Features

### Feature 1: View Initialization
- [ ] Kanban view appears without errors
- [ ] Board layout shows with columns
- [ ] If no grouping configured, see error message: "No grouping property configured..."

### Feature 2: Grouping Configuration
- [ ] View options show "Group by" property selector
- [ ] Default grouping property is "status"
- [ ] Can select different properties to group by
- [ ] Board updates when grouping property changes

### Feature 3: Column Rendering
- [ ] Each unique group value creates a column
- [ ] Column header shows property value and count
- [ ] Cards display in columns with all visible properties
- [ ] Empty columns are shown (workflow visibility)

### Feature 4: Card Rendering
- [ ] Cards show all configured visible properties
- [ ] Property labels and values render correctly
- [ ] Property values with links are clickable
- [ ] Cards have proper spacing and hover effects

### Feature 5: Card Drag-Drop
- [ ] Cards are draggable (cursor changes to grab)
- [ ] Card shows dragging state (reduced opacity, shadow)
- [ ] Can drag cards between columns
- [ ] Drop zone highlights on drag-over
- [ ] **Note:** Property update not yet implemented (TODO)

### Feature 6: Column Reordering
- [ ] Column headers are draggable
- [ ] Column header shows dragging state
- [ ] Can drag headers to reorder columns
- [ ] Drop target shows left border accent
- [ ] Column order persists on reload (reload Obsidian and check)

### Feature 7: Virtual Scrolling
- [ ] Create a column with 30+ items
- [ ] Scroll through items smoothly
- [ ] Only visible cards are rendered (check DevTools)
- [ ] Performance is smooth even with hundreds of items

### Feature 8: Error Handling
- [ ] No JavaScript errors in console
- [ ] Missing grouping property shows user-friendly error
- [ ] Empty Base shows helpful "no items" message
- [ ] Console shows [KanbanBasesView] prefixed debug logs

## Testing Checklist

```
Installation & Enablement
  [ ] Plugin appears in installed plugins
  [ ] Can be enabled/disabled without errors
  [ ] No console errors on enable

View Initialization
  [ ] View opens without crashing
  [ ] Kanban board renders
  [ ] Initial state makes sense

Grouping
  [ ] "Group by" option visible in view settings
  [ ] Can change grouping property
  [ ] Board updates on grouping change

Columns & Cards
  [ ] Columns created for each group value
  [ ] Card count shown in headers
  [ ] All properties display on cards
  [ ] Empty columns show placeholder

Drag-Drop (Cards)
  [ ] Cards are draggable
  [ ] Visual feedback on drag
  [ ] Can move between columns
  [ ] Drop zones highlight

Drag-Drop (Columns)
  [ ] Column headers are draggable
  [ ] Visual feedback on header drag
  [ ] Can reorder columns
  [ ] Order persists on reload

Virtual Scrolling
  [ ] Large columns scroll smoothly
  [ ] Memory efficient (DevTools check)
  [ ] No performance issues

Error Handling
  [ ] No console errors
  [ ] Helpful error messages
  [ ] Debug logs appear in console
```

## Development Mode

### Automatic Rebuild on File Changes

```bash
cd /mnt/Store/Projects/Experiements/ObsidianCustomPropertyUi
npm run dev
```

This watches `src/**` for changes and rebuilds automatically.

### Manual Install After Build

After making changes and rebuilding:

```bash
bash tools/install-plugin.sh
```

Then reload Obsidian (Cmd+R / Ctrl+R) to test.

### Checking DevTools Console

1. **Mac:** Cmd+Option+I
2. **Windows/Linux:** Ctrl+Shift+I
3. Look for `[KanbanBasesView]` prefixed logs

## Known Limitations

### TODO: Property Updates
- Cards can be dragged between columns but changes don't persist yet
- The `updateEntryProperty()` method needs to be implemented using the Obsidian/Bases API
- Check console logs for what would be updated

### Not Yet Implemented
- Swimlanes (2D grouping)
- Filter integration
- Custom sorting
- Create new items from kanban
- Edit items inline

## Debugging

### Check Plugin Load
```javascript
// In Obsidian DevTools console:
app.plugins.plugins['obsidian-kanban-bases']
```

### View Plugin Logs
```javascript
// Console shows all [KanbanBasesView] prefixed messages
// Filter: "[KanbanBasesView]"
```

### Rebuild Plugin
```bash
cd /mnt/Store/Projects/Experiements/ObsidianCustomPropertyUi
npm run build
bash tools/install-plugin.sh
# Then reload Obsidian
```

## Reporting Issues

When testing, note:
- What you were doing when issue occurred
- Error messages (if any) in console
- Which properties were configured
- Expected vs actual behavior

## Next Steps

After successful testing:
1. [ ] Implement property updates (updateEntryProperty)
2. [ ] Add swimlanes support
3. [ ] Test with various property types (select, checkbox, date, etc.)
4. [ ] Performance test with large datasets (1000+ items)
5. [ ] Keyboard navigation support
