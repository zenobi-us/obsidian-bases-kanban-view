# Obsidian Kanban Bases View Plugin

A custom Obsidian Bases view that displays data in a **kanban board layout** with drag-drop support for organizing items across configurable columns.

<img width="1805" height="1129" alt="image" src="https://github.com/user-attachments/assets/f2fe02c8-6195-429e-be88-26c3965344f8" />


## Features

- **Configurable Grouping** - Group items using standard Bases properties
- **Drag-Drop Cards** - Move cards between columns (visual feedback)
- **Reorder Columns** - Drag column headers to reorganize
- **Persistent Layout** - Column order saved in base view settings
- **Virtual Scrolling** - Smooth performance with 100+ items
- **All Properties Displayed** - Shows all visible properties on cards
- **Robust Error Handling** - Helpful error messages and debug logging

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

Then reload Obsidian (Win + P > Reload app) to see changes.

## Usage

### Instaling

For now, use BRATS to install the plugin:

1. Go to **Settings** → **Community plugins** → **BRAT**
2. Find and click **Add beta plugin**
3. Paste the plugin repo URL: `https://github.com/zenobi-us/obsidian-bases-kanban-view`
4. Click **Add plugin**

### Enable the Plugin

1. Go to **Settings** → **Community plugins** → **Installed plugins**
2. Search for **Kanban Bases View** and enable it
3. Configuration occurs in the Base view

### Open a Base in Kanban View

1. Open a Base file
2. Click the **view selector dropdown** (top-right)
3. Select **"Kanban"**

### Configure Grouping

1. Click the **Sort** icon
2. Add a **"Group by"** property
3. Board updates automatically

**Non uniform grouping values**

If your notes have disparate values, consider using a formula property to standardize grouping.

```yaml

formulas:
  normalisedStatus: |-
    if(
      note.status.containsAny("todo", "pending", "planned"),
      "Todo",

      if(
        note.status.containsAny("in-progress", "in-development", "active"),
        "In Progress",

        if(
          note.status.containsAny("in-review", "reviewing", "testing"),
          "In Review",

          if(
            note.status.containsAny("done", "closed", "cancelled"),
            "Done",
            "Backlog"
          )

        )

      )

    )
```

Then group by `normalisedStatus` for consistent columns.

**Fallback group for unmatched items**

```yaml

formulas:
  normalisedIssueKind: |-
    if(
      file.path.contains("epic"),
      "epic",

      if(
        file.path.contains("story"),
        "story",

        if(
          file.path.contains("task"),
          "task",

          if(
            file.path.contains("decision"),
            "decision",

            if(
              file.path.contains("research"),
              "research",
              "unknown"
            )

          )

        )

      )

    )
```

### Card display

Displaying values in the card is currently a controlled affair.

1. Open the Base options dropdown
2. Expand the **Cards** section
3. Pick the formula/property to display for each field.

### Drag-Drop Cards

- **Drag cards** between columns to move them
- Visual feedback during drag (opacity + shadow)
- Drop zone highlights on hover
- Moving cards updates the options.GroupBy property value with a slugified version of the column name

Cards can be dragged between columns to change their grouping property.

Make sure you pick the correct field to update in the **Columns** section of Base options.


## Known Limitations

### Not Yet Implemented

- Swimlanes (2D grouping)
- Filter integration
- Create/edit items inline
- Keyboard navigation
- Custom card templates
- Using a note as the template for rendering cards

## Contributing

For bug reports or feature requests:

1. Test with the current code
2. Note console errors
3. Document steps to reproduce
4. Describe expected vs actual behavior
