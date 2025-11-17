# Agent Guidelines for Obsidian Kanban Plugin

Always remind yourself by reading `.notes/SESSION_CONTEXT.md` before starting work.

## Commands 

Check `mise tasks` before assuming the normal place.

**CRITICAL: Always use `pnpm` for package management, not npm.** The project uses pnpm workspaces and npm will timeout.

## Manifest.json Schema

**⚠️ CRITICAL: manifest.json has a strict schema. Preserve all fields!**

```json
{
  "id": "obsidian-kanban-bases",
  "name": "Kanban Bases View",
  "version": "1.0.0",
  "minAppVersion": "1.10.3",
  "description": "A kanban view for Obsidian database bases with drag-drop support",
  "author": "zenobi-us",
  "authorUrl": "https://github.com/zenobi-us",
  "fundingUrl": "https://github.com/sponsors/zenobi-us",
  "isDesktopOnly": false
}
```

- **version:** Synced FROM package.json (primary) via release-please extra-files configuration
- **minAppVersion:** Obsidian API compatibility requirement
- **id:** Plugin identifier (used by Obsidian registry)
- **All fields required:** Don't strip fields to "simplify" - each is needed by Obsidian

**Example of WRONG approach (DON'T DO THIS):**
```json
{
  "id": "obsidian-kanban-bases",
  "version": "2.0.0"
}
```
❌ Missing required fields - plugin won't load!

## Vault Configuration

On first run of `pnpm dev`, you'll be prompted to enter your Obsidian vault path (directory containing `.obsidian/`). This path is stored in `.notes/VAULT_PATH` (gitignored) so it persists across sessions. To change the vault path, edit `.notes/VAULT_PATH` directly or delete it to be prompted again on next `pnpm dev` run.

## Code Style & Conventions

**Imports:** Organize as 1) obsidian library imports, 2) local util imports, 3) CSS imports. Use named imports.  
**Formatting:** Always run `mise run format` before committing.
**TypeScript:** `strict: true` enforced. All functions must have explicit return types. Private methods use underscore prefix (`_methodName`).  
**Naming:** Classes use PascalCase, methods/properties use camelCase. Constants use UPPER_SNAKE_CASE (e.g., `KANBAN_VIEW_TYPE`).  
**NeverNester**: Avoid deep nesting by early returns or helper functions.
**Error Handling:** Wrap data access in try-catch for localStorage/JSON parsing. Log errors with `[KanbanBasesView]` prefix. Always check null/undefined before accessing properties.  
**Logging:** Use `console.debug()` and `console.warn()` with `[KanbanBasesView]` prefix for debugging. Log meaningful state during operations (see src/views/KanbanBasesView.tsx line 75-79 as reference).

## Key Architecture

### Plugin Structure

- **Entry:** `src/main.ts` (24 lines)
  - Registers plugin with Obsidian Bases API
  - Creates Kanban view factory
  - Loads global CSS styles

- **View:** `src/views/KanbanBasesView.tsx` (140+ lines)
  - Extends `BasesView` (Obsidian Bases API)
  - Manages React root lifecycle (mounted in constructor, unmounted in onunload)
  - Listens to data updates via `onDataUpdated()` 
  - Delegates state management to `KanbanStateController`
  - Renders via React using `createRoot()`

- **State Controller:** `src/utils/KanbanStateController.ts` (200+ lines)
  - Parses `BasesQueryResult` from Obsidian
  - Transforms data into kanban structure (groups, columns, entries)
  - Manages card drag-drop → property updates (frontmatter persistence)
  - Emits 'updated' events to trigger view re-renders
  - Uses `BasesEntry` API for property access/updates

- **Components:** `src/components/` - Reusable React components
  - `KanbanView.tsx` - Main board wrapper, error states
  - `Column.tsx` - Column container
  - `Card.tsx` - Individual card display
  - `Draggable.tsx` / `Droppable.tsx` - Drag-drop zone wrappers
  - `FilterButtonField.tsx` - Filter UI
  - `Notice.tsx` - Notifications
  - `OverlayCard.tsx` - Tooltip/overlay display

- **Styles:** CSS modules (one per component)
  - `src/styles/global.css` - Shared theme/utilities
  - `src/components/Card.module.css`, `Column.module.css`, etc.

- **Utilities:** `src/utils/`
  - `KanbanStateController.ts` - State management (above)
  - `strings.ts` - Case conversion (toSentenceCase, toSlugCase)

### Data Flow

```
Obsidian Bases API
    ↓
onDataUpdated() → isKanbanQueryResult() validation
    ↓
KanbanStateController.update(data)
    ├─ Parses: properties, groupedData, config
    ├─ Creates: column map, entry index
    └─ Emits: 'updated' event
    ↓
KanbanBasesView.render(data)
    ├─ Always recreates React root on each update
    └─ Renders <KanbanView /> with parsed data
    ↓
React Components
    ├─ Drag-drop handlers (onCardMove)
    └─ Display: columns, cards, properties
    ↓
User drag-drops card → onCardMove(cardId, targetGroupId)
    ↓
KanbanStateController.moveCard()
    ├─ Updates entry frontmatter
    ├─ Persists via Obsidian FileManager API
    └─ Triggers data refresh → re-render
```

### Key Mechanisms

- **Grouping:** By property value (user-selectable via view options)
- **Rendering:** React component hierarchy renders columns and cards
- **Persistence:** Frontmatter updates via Obsidian FileManager
- **Configuration:** View options stored in Obsidian database view settings

## Debugging

**View logs:** Filter console for `[KanbanBasesView]` prefix. Run `pnpm dev` before testing changes.  
**DevTools:** Mac (Cmd+Option+I) or Linux/Windows (Ctrl+Shift+I) to inspect plugin runtime.  

**Key Issues & Known Limitations:**
- React root recreation: KanbanBasesView.render() unmounts/recreates root on every update (should reuse for perf)
- Frontmatter null-safety: moveCard() throws on undefined frontmatter (should initialize empty object)
- Performance tests skipped: .skip() on all benchmarks - verify <100ms render time before shipping
- Error boundary missing: No error boundary wrapper - single component error crashes entire plugin

## Context & Notes for Agents

1. Use basicmemory project storage backend for any memory needs (project: `obsidian-kanban-plugin`)
2. Write temporary files to `.notes/` directory (gitignored)
3. Update `.notes/SESSION_CONTEXT.md` with high-level focus for multi-session continuity
4. Always read AGENTS.md before starting work - it's the source of truth for project context
5. Reference research artifacts in basicmemory for version sync, codebase issues, etc.

## Release & Version Management

**Version Sync:** manifest.json and package.json are synced via release-please extra-files configuration
- Primary file: package.json (source of truth)
- Extra file: manifest.json (auto-synced by release-please)
