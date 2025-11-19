# Obsidian Kanban Bases View Plugin - Copilot Instructions

## Repository Overview

This is an **Obsidian plugin** that provides a **kanban board view** for Obsidian Bases (database functionality). The plugin integrates with Obsidian's Bases API to display data in a drag-and-drop kanban board layout with configurable grouping, virtual scrolling, and persistent column ordering.

**Key Technologies:**
- TypeScript (strict mode enabled)
- React 19.2.0 with JSX
- Vite for building
- Vitest for testing
- @dnd-kit for drag-and-drop
- @tanstack/react-virtual for virtual scrolling

## Build, Test, and Lint Commands

### Package Manager
**CRITICAL: Always use `pnpm` for package management, not npm.** The project uses pnpm workspaces and npm will timeout.

### Installation
```bash
pnpm install --frozen-lockfile
```

### Development
```bash
# Using mise (preferred for local development)
mise run dev

# Manual build with watch mode
pnpm vite build --watch
```

### Building
```bash
# Production build
pnpm vite build --mode production

# Development build
pnpm vite build
```

### Type Checking
```bash
tsc -noEmit
```

### Testing
```bash
# Run all tests
vitest run

# Run tests in watch mode
vitest watch

# Run tests with coverage
vitest run --coverage

# Run specific test file
vitest run src/__tests__/KanbanBoard.test.tsx
```

### Linting
```bash
# Check for linting errors
eslint src --ext .ts,.tsx

# Auto-fix linting errors (if possible)
eslint src --ext .ts,.tsx --fix
```

### Full Check Suite
```bash
# Run all checks (typecheck, lint, test)
mise run check
```

Note: The `mise run check` command requires `VAULT_PATH` environment variable to be set to a valid Obsidian vault directory.

## Project Structure

```
obsidian-bases-kanban-view/
├── .github/              # GitHub workflows and configurations
│   ├── workflows/        # CI/CD workflows (PR checks, releases)
│   └── copilot-instructions.md  # This file
├── .mise/                # Mise task definitions
│   └── tasks/            # Build automation scripts
├── src/
│   ├── main.ts           # Plugin entry point, registers with Obsidian Bases API
│   ├── views/
│   │   └── KanbanBasesView.ts  # Core kanban board (523 lines) - drag-drop, grouping, virtual scrolling
│   ├── components/       # React components for kanban board UI
│   ├── utils/
│   │   └── VirtualScroller.ts  # Virtual scrolling implementation (99 lines)
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── styles/
│   │   └── kanban.css    # Card/column styling and drag-drop states (150+ lines)
│   └── __tests__/        # Test files (vitest + testing-library)
├── docs/                 # Documentation
├── manifest.json         # Obsidian plugin manifest
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration (strict: true)
├── vite.config.mjs       # Vite build configuration
├── vitest.config.mjs     # Vitest test configuration
└── AGENTS.md             # Agent-specific development guidelines
```

## Key Architecture

### Plugin Entry Point
- **`src/main.ts`**: Registers the plugin with Obsidian's Bases API, defines the custom view type

### Core View
- **`src/views/KanbanBasesView.ts`**: Main kanban board implementation
  - Manages data flow: `this.data.data` → grouped by `groupByPropertyId` → rendered
  - Handles drag-drop operations for cards and columns
  - Implements virtual scrolling for columns with 30+ items
  - Manual grouping (no API support yet)

### Virtual Scrolling
- **`src/utils/VirtualScroller.ts`**: Renders only visible cards in columns for performance
  - Uses @tanstack/react-virtual
  - Critical for handling 100+ items

### Styling
- **`src/styles/kanban.css`**: Card/column styling, drag-drop visual feedback

### Data Flow
```
Base data → KanbanBasesView → Grouped by property → Virtual Scroller → Rendered cards
```

## Code Style & Conventions

### TypeScript
- **Strict mode enabled** (`strict: true` in tsconfig.json)
- All functions **must have explicit return types**
- Private methods use underscore prefix: `_methodName()`
- No `any` types - use proper TypeScript types
- Use `const` and `let` (never `var`)

### Imports
Organize imports in this order:
1. Obsidian library imports
2. Local utility imports
3. CSS imports

Always use **named imports**, not default imports.

```typescript
// Good
import { Plugin, TFile } from 'obsidian';
import { VirtualScroller } from './utils/VirtualScroller';
import './styles/kanban.css';

// Bad
import * as obsidian from 'obsidian';
```

### Formatting
- **2-space indentation** (no tabs)
- **Semicolons required**
- **No trailing commas**
- Use arrow functions for callbacks

### Naming Conventions
- **Classes**: PascalCase (e.g., `KanbanBasesView`)
- **Methods/Properties**: camelCase (e.g., `updateColumnOrder`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `KANBAN_VIEW_TYPE`)
- **Private methods**: underscore prefix (e.g., `_initializeView`)

### Error Handling
- Wrap data access in try-catch for localStorage/JSON parsing
- Always check for null/undefined before accessing properties
- Log errors with `[KanbanBasesView]` prefix for easy filtering

```typescript
try {
  const data = JSON.parse(localStorage.getItem('key'));
  if (data?.property) {
    // Safe to use
  }
} catch (error) {
  console.error('[KanbanBasesView] Failed to parse data:', error);
}
```

### Logging
- Use `console.debug()` for debugging information
- Use `console.warn()` for warnings
- Use `console.error()` for errors
- Always prefix with `[KanbanBasesView]` for easy filtering
- Log meaningful state during operations (see `src/views/KanbanBasesView.ts` lines 75-79 as reference)

```typescript
console.debug('[KanbanBasesView] Initializing with data:', this.data);
console.warn('[KanbanBasesView] No grouping property found, using default');
console.error('[KanbanBasesView] Failed to update entry:', error);
```

## Testing Guidelines

### Test Framework
- **Vitest** with happy-dom environment
- **@testing-library/react** for component testing
- Globals enabled (no need to import `describe`, `it`, `expect`)

### Test Structure
- Test files: `src/__tests__/**/*.test.ts` or `*.test.tsx`
- Mock files: `src/__tests__/mocks/`
- Setup: `src/__tests__/setup.ts`

### Coverage Requirements
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Writing Tests
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    const props = { /* ... */ };
    
    // Act
    const result = render(<Component {...props} />);
    
    // Assert
    expect(result.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Running Tests
- Run all tests: `vitest run`
- Watch mode: `vitest watch`
- Specific file: `vitest run path/to/test.test.tsx`
- Coverage: `vitest run --coverage`

## Development Workflow

### Initial Setup
1. Clone repository
2. Run `pnpm install --frozen-lockfile`
3. For local development with Obsidian:
   - Run `mise run dev` (prompts for vault path on first run)
   - Vault path stored in `.notes/VAULT_PATH` (gitignored)

### Making Changes
1. Create a feature branch
2. Make minimal, focused changes
3. Run `tsc -noEmit` to check types
4. Run `vitest run` to ensure tests pass
5. Run `eslint src --ext .ts,.tsx` to check linting
6. Build: `pnpm vite build`

### Testing Changes in Obsidian
1. Build with `pnpm vite build --watch` or `mise run dev`
2. Changes are symlinked to vault's `.obsidian/plugins/` directory
3. Reload Obsidian (Windows: Ctrl+R, Mac: Cmd+R, or use Command Palette → "Reload app")
4. Filter console logs by `[KanbanBasesView]` to debug

### CI/CD
- PR checks run on every pull request
- Checks include: TypeScript compilation, linting, tests
- Release automation via release-please

## Release Process

1. Work on branches based on `main`
2. Commits message style on your branch doesn't matter
3. Make your PR against `main`
4. The PR title of your PR MUST follow conventional commit style:
   - `fix: description` for bug fixes
   - `feat: description` for new features
   - `chore: description` for maintenance tasks
5. Once PR is merged, release-please will manage changelog, version bump and git tags
6. When new git tag is pushed starting with `v`, GitHub Actions will build the plugin and create a release with attached artifacts.

### Pre Releases

- tag any commit on main with `vX.Y.Z-rc.N` to trigger a pre-release build
- wait for GitHub Actions to create the release
- download the artifact from the release page

### Hotfix Releases

- When merging a PR from a normal release, there should be a snapshot branch for that release (e.g., `snapshot/1.2.0`)
- Create a PR against the release/* branch (created from the snapshot) with the hotfix changes
- The PR title MUST follow conventional commit style as well
- Once merged, release-please will create a new patch release (e.g., `v1.2.1`)
- The new git tag will trigger GitHub Actions to build and create the release

### Release-Please Configuration Notes

- `.github/release-please-config.json` defines the release process for normal releases.
  - This bumps minor versions for new features.
- `.github/release-please-config.hotfix.json` defines the release process for hotfix.
  - This bumps patch versions for commits.
- There are two separate configurations to allow hotfix releases without affecting the normal release cadence.
- Both configurations use `node` release type, which means they update the `package.json` version. They also have `extra-files` configured to update `manifest.json` version as well.
- `.github/release-please-manifest.json` tracks the last released version.
## Known Limitations and Context

### Not Yet Implemented
- Swimlanes (2D grouping)
- Filter integration
- Create/edit items inline
- Keyboard navigation
- Custom card templates: Using a note as the template for rendering cards

### Technical Debt
- Virtual scrolling optimization for very large datasets (1000+ items)

### Obsidian API Integration
- Plugin uses Obsidian Bases API (still evolving)
- View registration: `this.registerView(KANBAN_VIEW_TYPE, ...)`
- Data access: `this.data.data` from base view
- Property updates: Uses obsidian API methods to modify note properties

### Performance Considerations
- Drag-drop operations are handled by @dnd-kit
- No performance optimizations for very large datasets yet
- No virtual scrolling implemented for columns

## Agent-Specific Notes

For more detailed agent-specific guidelines, see `AGENTS.md` in the repository root. That file contains:
- Command usage (mise tasks)
- Vault configuration details
- Debugging tips with DevTools
- Context & notes workflow for persistent agent memory

## Common Tasks

### Adding a New Feature
1. Read relevant code in `src/views/KanbanBasesView.ts` to understand data flow
2. Create React components in `src/components/`
3. Add tests in `src/__tests__/`
4. Update styles in `src/styles/kanban.css`
5. Run full check suite: `mise run check`

### Fixing a Bug
1. Filter console for `[KanbanBasesView]` to identify error location
2. Write a failing test first
3. Fix the bug with minimal changes
4. Ensure test passes and no other tests break
5. Run `mise run check`

### Updating Dependencies
1. Use `pnpm add <package>` or `pnpm add -D <package>`
2. Test thoroughly after updates
3. Update `pnpm-lock.yaml` by running `pnpm install`
4. Verify build still works: `pnpm vite build`

## External Resources

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Bases Documentation](https://docs.obsidian.md/Plugins/Bases)
- [React DnD Kit Documentation](https://docs.dndkit.com/)
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest)

## Questions or Issues?

- Check console logs filtered by `[KanbanBasesView]`
- Review existing tests for examples
- See `AGENTS.md` for agent-specific debugging tips
- File issues with reproduction steps and console errors
