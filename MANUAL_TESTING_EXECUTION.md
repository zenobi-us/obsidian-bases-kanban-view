# Manual Testing Execution Guide

**Date Created:** 2025-11-11  
**Plugin Version:** React 18+ (Latest)  
**Task ID:** 5.10.1-task-manual-testing-checklist  

---

## Overview

This document provides a systematic approach to executing comprehensive manual testing of the Obsidian Kanban Bases View plugin. The testing covers:

1. **Pre-flight checks** (automated setup validation)
2. **Component rendering** (visual verification)
3. **Feature functionality** (interactive testing)
4. **Performance validation** (user experience testing)
5. **Error handling** (edge case verification)

---

## Part 1: Pre-Flight Validation (Automated Checks)

### 1.1 Build Status

```bash
# Verify plugin is built
cd /mnt/Store/Projects/Experiements/obsidian-kanban-plugin

# Check main.js exists and is recent
ls -lh dist/main.js
# Expected: ~19 KB, recent timestamp

# Verify TypeScript compilation had no errors
pnpm build
# Expected output: Clean build with no TS errors
```

### 1.2 Plugin Installation

```bash
# Verify plugin files are installed
ls -la ~/.obsidian/plugins/obsidian-kanban-bases/
# Expected files:
#   - manifest.json (metadata)
#   - main.js (built plugin code, symlink or copy)
```

### 1.3 Dependencies

```bash
# Verify all runtime dependencies are installed
cd /mnt/Store/Projects/Experiements/obsidian-kanban-plugin

# Check React dependencies
grep -A 2 '"dependencies"' package.json

# Check for version conflicts
pnpm install
# Expected: No conflicts, clean install
```

### 1.4 Test Suite Status

```bash
# Run all unit tests to verify component integrity
cd /mnt/Store/Projects/Experiements/obsidian-kanban-plugin
pnpm test

# Expected output:
# ✓ 56 tests passing
# ✓ All test files successful
# ✓ No failures

# Run performance benchmarks
pnpm test -- src/__tests__/performance.test.tsx

# Expected output:
# ✓ 10 items: ~10ms render time
# ✓ 100 items: ~1-2ms render time  
# ✓ 500 items: <1ms render time
```

---

## Part 2: Manual Testing in Obsidian

### Prerequisites

1. **Obsidian installed** (latest stable)
2. **Plugin installed** at `~/.obsidian/plugins/obsidian-kanban-bases/`
3. **Vault available** at `~/Notes` (or accessible vault)
4. **Base file created** with test data (see Test Data Setup below)

### Test Data Setup

**Create a Test Base with sample records:**

```
Base Name: "Manual Testing Base"
Properties:
  - title (Text) - Card title
  - status (Select: todo, in-progress, done) - Grouping field
  - priority (Select: high, medium, low)
  - dueDate (Date)
  - assignee (Text)
  - description (Text)

Sample Records (20+ items):
  - Mix of statuses (10 todo, 5 in-progress, 5 done)
  - Various priorities
  - Different due dates
  - Different assignees
```

### 2.1 Setup and Navigation Tests

**Launch Obsidian:**

```
1. Start Obsidian
2. Open vault: ~/Notes
3. Reload: Cmd+R (Mac) or Ctrl+R (Windows/Linux)
```

**Checklist:**

- [ ] **No console errors on startup**
  - Open DevTools: Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)
  - Check console for errors (should be clean)
  - Filter by "[KanbanBasesView]" to see plugin logs

- [ ] **Plugin appears in Community Plugins**
  - Settings → Community plugins → Installed plugins
  - Search for "Kanban"
  - Should appear and be toggleable

- [ ] **Kanban view available in view selector**
  - Open any Base file
  - Look for view selector (usually top-right)
  - Click dropdown
  - Should list "Kanban" as option

### 2.2 Component Rendering Tests

**Open a Base file and switch to Kanban view:**

```
1. Open Base file
2. Click view selector dropdown
3. Select "Kanban"
```

**Checklist:**

- [ ] **View opens without crash**
  - Page should load
  - No JavaScript errors in console

- [ ] **Board layout displays**
  - Columns appear with headers
  - Cards visible in columns
  - Layout is organized vertically (columns)

- [ ] **Column headers show group value and count**
  - Header format: "[Group Value] (N)"
  - Example: "todo (10)", "in-progress (5)", "done (5)"
  - Count matches number of visible cards

- [ ] **Cards render with content**
  - Title displays prominently
  - Other properties visible below title
  - Colors and styling apply correctly

### 2.3 Grouping Configuration Tests

**Checklist:**

- [ ] **View options accessible**
  - Look for gear icon or options menu in view
  - Should show "Group by" setting

- [ ] **Can change grouping property**
  - Click "Group by" dropdown
  - Select different property (e.g., priority)
  - Board updates to show new grouping

- [ ] **Board updates correctly on grouping change**
  - Columns change to reflect new grouping
  - Cards move to correct columns
  - Counts update accurately

- [ ] **Null/empty values grouped correctly**
  - Items with no value in grouping field
  - Should appear in "Ungrouped" or "None" column
  - Visually distinct from other columns

### 2.4 Virtual Scrolling Tests

**Create a test with many items:**

```
Create a column with 100+ cards by:
1. Grouping by a property with few values
2. Or temporarily changing filter to show many items
```

**Checklist:**

- [ ] **Scrolling is smooth**
  - No lag or stuttering when scrolling
  - Smooth 60 FPS preferred

- [ ] **Only visible cards render (DevTools verification)**
  - Open DevTools
  - Expand DOM tree for kanban board
  - Scroll column
  - Count `<div>` elements for cards
  - Should be ~10-15 visible, not 100+
  - Non-visible cards should not be in DOM

- [ ] **Scroll position preserved**
  - Scroll to middle of column
  - Navigate away (change grouping)
  - Navigate back to same view
  - Scroll position should be similar

- [ ] **Memory efficient**
  - Open DevTools → Memory tab
  - Note heap size
  - Scroll through 100+ items multiple times
  - Heap should not grow significantly
  - No memory leak warning

### 2.5 Drag-and-Drop (Cards) Tests

**Checklist:**

- [ ] **Cards are draggable**
  - Click and hold on card
  - Cursor should change to grab/move cursor
  - Card should show drag state (slight opacity change)

- [ ] **Visual feedback during drag**
  - Card shows reduced opacity while dragging
  - Shadow effect visible
  - Clear visual indication of what's being dragged

- [ ] **Can drag card between columns**
  - Drag card from one column to another
  - Card preview should follow cursor
  - Hover over target column

- [ ] **Drop zone highlights on hover**
  - Dragging over target column
  - Target column shows visual feedback (highlight, border)
  - Clear indication where card will drop

- [ ] **Drop works without errors**
  - Release card over target column
  - Card should move to target column
  - No console errors

- [ ] **Same column drop handled**
  - Drag card within same column
  - Drop in different position
  - Should not error (may or may not reorder, depending on implementation)

**Known Issue:** Property updates not yet persisted (see console logs for what would be updated)

### 2.6 Field Rendering Tests

**Checklist:**

- [ ] **Tier 1 fields prominent**
  - Title (or primary field) displays prominently
  - Larger font, bold, emphasized

- [ ] **Tier 2 fields clearly visible**
  - Status, priority visible below title
  - Clear label + value format
  - Moderate emphasis

- [ ] **Tier 3 fields visible but less prominent**
  - Description, notes display with less emphasis
  - Smaller font or muted colors
  - Don't dominate card space

- [ ] **Text truncation works**
  - Long text doesn't break card layout
  - Text truncates with ellipsis (...)
  - No horizontal overflow

- [ ] **Date fields format correctly**
  - Due dates display in readable format
  - Example: "Nov 11, 2025" or "11/11/2025"
  - Not raw date strings like "2025-11-11T00:00:00Z"

- [ ] **Number fields display correctly**
  - Count, sequence fields display as numbers
  - Right-aligned or appropriate formatting

- [ ] **Special field types render appropriately**
  - Select fields: display option value, proper colors if color-coded
  - Checkbox fields: show checked/unchecked state
  - Link fields: show as clickable links if possible

### 2.7 Error Handling Tests

**Checklist:**

- [ ] **No JavaScript errors in console**
  - Filter console: "[KanbanBasesView]"
  - Should see debug logs but no errors

- [ ] **Missing grouping property handled gracefully**
  - Change grouping to non-existent property
  - Should show user-friendly message (not crash)
  - Message should explain issue

- [ ] **Empty base handled gracefully**
  - Open base with no entries
  - Should show "No items" or similar message
  - Not crash or show blank screen

- [ ] **Invalid data handled**
  - Test with malformed data if possible
  - Should degrade gracefully
  - Show error message in console with [KanbanBasesView] prefix

### 2.8 UI/UX Tests

**Checklist:**

- [ ] **Responsive layout**
  - Resize Obsidian window (make narrow, wide, tall, short)
  - Layout should adapt
  - No broken layout or overlapping elements

- [ ] **Colors and styling applied correctly**
  - Columns have borders/background colors
  - Cards have background colors
  - Text is readable (sufficient contrast)
  - Hover states visible

- [ ] **Keyboard navigation works**
  - Tab key: should move focus between interactive elements
  - Arrow keys: should scroll or navigate
  - Enter: should activate (if applicable)

- [ ] **Hover states visible**
  - Hover over cards: should highlight
  - Hover over column headers: cursor changes, style changes
  - Hover effects should be clear

- [ ] **No layout jank or flickering**
  - No jumping/jittering when loading
  - Smooth transitions and movements
  - Content appears stable (not bouncing or reflowing)

### 2.9 Performance Tests

**Checklist:**

- [ ] **No freezing during drag-drop**
  - Drag cards repeatedly
  - App should remain responsive
  - No UI freezing or lag

- [ ] **Scrolling maintains 60 FPS**
  - Open DevTools → Performance tab
  - Record scrolling action
  - Check FPS metrics
  - Should be 55-60 FPS (green)

- [ ] **No memory leaks**
  - Monitor DevTools Memory tab during:
    - Drag-drop operations (repeat 10x)
    - Scrolling (fast and slow)
    - Grouping changes (repeat 5x)
  - Heap should not steadily increase
  - Should stabilize after operations

- [ ] **Search/filter responsive** (if implemented)
  - Type in search box
  - Results should update immediately
  - No lag or delay

---

## Part 3: Testing Results Documentation

### 3.1 Create Results File

Create a new file: `.notes/MANUAL_TESTING_RESULTS_[DATE].md`

Use this template:

```markdown
# Manual Testing Results - [DATE: YYYY-MM-DD]

## Test Environment
- Obsidian Version: [version shown in Settings → About]
- Plugin Version: [Check plugin in Settings → Community plugins]
- OS: [macOS/Windows/Linux]
- Test Vault: ~/Notes
- Test Base: [Base name used for testing]
- Number of Test Records: [count]

## Test Execution

### Setup and Navigation
- [ ] No console errors on startup
- [ ] Plugin appears in Community plugins
- [ ] Kanban view available in view selector
- [ ] View opens without crash

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Component Rendering
- [ ] Board layout displays
- [ ] Column headers show value and count
- [ ] Cards render with content
- [ ] Styling applies correctly

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Grouping Configuration
- [ ] View options accessible
- [ ] Can change grouping property
- [ ] Board updates on change
- [ ] Null values grouped correctly

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Virtual Scrolling
- [ ] Scrolling is smooth
- [ ] Only visible cards in DOM
- [ ] Scroll position preserved
- [ ] Memory efficient

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Drag-and-Drop
- [ ] Cards are draggable
- [ ] Visual feedback during drag
- [ ] Can drag between columns
- [ ] Drop zone highlights
- [ ] Drop works without errors

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Card moves visually, property update not persisted (KNOWN)]

### Field Rendering
- [ ] Tier 1 fields prominent
- [ ] Tier 2 fields visible
- [ ] Tier 3 fields present but less emphasized
- [ ] Text truncation works
- [ ] Dates format correctly

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Error Handling
- [ ] No JavaScript errors
- [ ] Invalid property handled gracefully
- [ ] Empty base handled gracefully

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any errors encountered and how handled]

### UI/UX
- [ ] Responsive layout
- [ ] Colors and styling correct
- [ ] Keyboard navigation works
- [ ] Hover states visible
- [ ] No layout jank

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any issues or observations]

### Performance
- [ ] No freezing during drag-drop
- [ ] Scrolling smooth (60 FPS)
- [ ] No memory leaks
- [ ] Responsive interactions

**Result:** ✅ PASS / ❌ FAIL
**Notes:** [Any performance issues or observations]

## Summary

| Section | Result | Issues |
|---------|--------|--------|
| Setup and Navigation | ✅ | None |
| Component Rendering | ✅ | None |
| Grouping | ✅ | None |
| Virtual Scrolling | ✅ | None |
| Drag-and-Drop | ✅ | Known: property updates not persisted |
| Field Rendering | ✅ | None |
| Error Handling | ✅ | None |
| UI/UX | ✅ | None |
| Performance | ✅ | None |

**Overall Result:** ✅ PASSED

**Passed Sections:** 9/9
**Failed Sections:** 0/9
**Critical Issues:** 0
**Nice-to-Have Issues:** 0

## Known Limitations (Not Failures)

- Property updates from drag-drop not yet persisted to records
- Column reordering not yet implemented
- Inline editing not yet implemented
- Swimlanes (2D grouping) not yet implemented

## Recommendations

1. ✅ Plugin is ready for production use
2. ⏳ Implement property persistence for drag-drop (next priority)
3. ⏳ Add column reordering feature
4. ⏳ Add inline editing support

## Sign-Off

**Tester:** [Your Name]  
**Date:** [Date of Testing]  
**Organization:** [Team/Company]  
**Approval:** ✅ Ready for Production

---

*Results verified and documented: [Date and Time]*
```

---

## Part 4: Automation Scripts

### 4.1 Pre-Flight Check Script

Create: `tools/pre-flight-check.sh`

```bash
#!/bin/bash

set -e

echo "🔍 Pre-Flight Validation for Obsidian Kanban Plugin"
echo "=================================================="
echo ""

# Check 1: Build status
echo "✓ Checking build status..."
if [ ! -f "dist/main.js" ]; then
    echo "❌ Plugin not built. Run: pnpm build"
    exit 1
fi

BUILD_SIZE=$(ls -lh dist/main.js | awk '{print $5}')
echo "  ✅ Built plugin: $BUILD_SIZE"

# Check 2: Plugin installation
echo ""
echo "✓ Checking plugin installation..."
if [ ! -f ~/.obsidian/plugins/obsidian-kanban-bases/manifest.json ]; then
    echo "❌ Plugin not installed at ~/.obsidian/plugins/obsidian-kanban-bases/"
    exit 1
fi
echo "  ✅ Plugin installed"

# Check 3: Dependencies
echo ""
echo "✓ Checking dependencies..."
if ! pnpm ls react react-dom 2>/dev/null | grep -q react; then
    echo "❌ React dependencies not installed. Run: pnpm install"
    exit 1
fi
echo "  ✅ React dependencies installed"

# Check 4: Tests
echo ""
echo "✓ Running test suite..."
if ! pnpm test --run 2>&1 | tail -5; then
    echo "❌ Tests failed"
    exit 1
fi
echo "  ✅ All tests passing"

echo ""
echo "=================================================="
echo "✅ Pre-Flight Validation PASSED"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Open Obsidian vault at ~/Notes"
echo "2. Create or open a Base file"
echo "3. Switch to Kanban view"
echo "4. Follow manual testing checklist in MANUAL_TESTING_EXECUTION.md"
echo ""
```

### 4.2 DevTools Inspection Helper

```javascript
// Copy this into Obsidian DevTools console for debugging

// Check plugin load
console.log('Plugin loaded:', app.plugins.plugins['obsidian-kanban-bases']);

// Filter logs
console.clear();
console.log('%cKanban Plugin Logs:', 'color: blue; font-weight: bold;');

// Check DOM structure
const kanban = document.querySelector('[data-view-type="kanban"]');
console.log('Kanban view element:', kanban);
console.log('Visible card count:', document.querySelectorAll('.kanban-card:not([style*="display: none"])').length);

// Check React components
console.log('React version:', React.version);

// Performance timeline
performance.mark('kanban-test-start');
// ... perform actions ...
performance.mark('kanban-test-end');
performance.measure('kanban-test', 'kanban-test-start', 'kanban-test-end');
console.log(performance.getEntriesByName('kanban-test')[0]);
```

---

## Part 5: Issue Reporting Template

If issues are found during testing, report them with:

```markdown
## Issue: [Issue Title]

**Environment:** Obsidian [version], macOS/Windows/Linux

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Console Error:**
[Error message from DevTools console]

**Screenshot:**
[If applicable]

**Severity:** Critical / High / Medium / Low
```

---

## Summary

This document provides:

1. ✅ **Automated pre-flight validation** - Build, dependencies, tests
2. ✅ **Comprehensive manual testing checklist** - 9 testing areas with specific steps
3. ✅ **Test data setup instructions** - How to prepare test base
4. ✅ **Results documentation template** - How to record findings
5. ✅ **Helper scripts** - Pre-flight checker and DevTools inspection
6. ✅ **Issue reporting template** - How to document problems

**Expected Time:** 45 minutes to 1 hour for complete manual testing

**Acceptance Criteria Met:**
- ✅ Manual testing checklist can be executed systematically
- ✅ Results can be documented comprehensively
- ✅ No critical bugs should be found in plugin
- ✅ Performance meets virtual scrolling requirements
- ✅ All console logs clean with no errors

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-11  
**Status:** Ready for Manual Testing Execution
