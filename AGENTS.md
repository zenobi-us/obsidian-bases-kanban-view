# Agent Guidelines for Obsidian Kanban Plugin

## Build & Development Commands

**Dev Mode:** `make dev` or `bash tools/dev.sh` - Watches `src/`, auto-rebuilds to `./dist/`, auto-installs to Obsidian (developer workflow)  
**Build Once:** `make build` or `npm run build` - Compiles TypeScript, runs type-check, bundles with esbuild to `./dist/` (one-time)  
**Type Check:** `make type-check` - Run TypeScript type checking only  
**Clean:** `make clean` - Removes `./dist/` directory

Build outputs go to `./dist/` (gitignored). No dedicated test framework exists. Manual testing is used (see TESTING.md).

## Code Style & Conventions

**Imports:** Organize as 1) obsidian library imports, 2) local util imports, 3) CSS imports. Use named imports.  
**Formatting:** 2-space indentation, semicolons required, no trailing commas. Use const/let (never var).  
**TypeScript:** `strict: true` enforced. All functions must have explicit return types. Private methods use underscore prefix (`_methodName`).  
**Naming:** Classes use PascalCase, methods/properties use camelCase. Constants use UPPER_SNAKE_CASE (e.g., `KANBAN_VIEW_TYPE`).  
**Error Handling:** Wrap data access in try-catch for localStorage/JSON parsing. Log errors with `[KanbanBasesView]` prefix. Always check null/undefined before accessing properties.  
**Logging:** Use `console.debug()` and `console.warn()` with `[KanbanBasesView]` prefix for debugging. Log meaningful state during operations (see src/views/KanbanBasesView.ts line 75-79 as reference).

## Key Architecture

- **Entry:** `src/main.ts` - Plugin registration with Obsidian Bases API
- **View:** `src/views/KanbanBasesView.ts` (523 lines) - Core kanban board with drag-drop, grouping, virtual scrolling
- **Util:** `src/utils/VirtualScroller.ts` (99 lines) - Renders only visible cards in columns
- **CSS:** `src/styles/kanban.css` (150+ lines) - Card/column styling and drag-drop states

Grouping is manual (no API support yet). Data flows from `this.data.data` → grouped by `groupByPropertyId` → rendered with virtual scrolling for 30+ items per column.

## Debugging

**View logs:** Filter console for `[KanbanBasesView]` prefix. Run `npm run dev` before testing changes.  
**DevTools:** Mac (Cmd+Option+I) or Linux/Windows (Ctrl+Shift+I) to inspect plugin runtime.  
**TODO:** Property updates from drag-drop not yet persisted (see `updateEntryProperty()` stub in KanbanBasesView.ts).

## Context & Notes for Agents

Write persistent context, research findings, and implementation notes to `.notes/` directory. Files here are gitignored, so they won't be committed but will persist across sessions.

Example workflow:
- `.notes/IMPLEMENTATION_PLAN.md` - Feature implementation strategy
- `.notes/DEBUGGING_NOTES.md` - Issues encountered and solutions
- `.notes/RESEARCH.md` - Investigation findings
- `.notes/DEPLOYMENT_SUMMARY.md` - Current build and feature status (already present)
