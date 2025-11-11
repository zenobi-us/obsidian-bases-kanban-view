# Manual Testing Guide - Story 4.5.10

## Overview

This guide provides comprehensive manual testing procedures for the Obsidian Kanban Bases View React plugin. Follow these steps to validate component rendering, performance, data integration, and user interactions.

## Test Environment Setup

### Prerequisites
- Obsidian vault with sample base data (Notes, Databases, Properties)
- Chrome DevTools open (DevTools → Performance tab for profiling)
- Browser console visible to check for errors
- Sample dataset: Create bases with 10, 100, and 500+ entries for load testing

### Launch Procedures

1. **Start Dev Server**
   ```bash
   cd /path/to/obsidian-kanban-plugin
   pnpm dev
   ```

2. **Open Obsidian**
   - Vault location: Points to your test vault
   - Plugin loaded: Kanban Bases View should appear in installed plugins

3. **Open a Base File**
   - Open any Base document in Obsidian
   - Look for "Kanban" view in view selector (top right)
   - Click to activate Kanban view

4. **Enable DevTools**
   - Mac: `Cmd+Option+I` or Debug menu
   - Windows/Linux: `Ctrl+Shift+I` or Debug menu
   - Check Console tab for errors

---

## Test Scenarios

### Section 1: Component Rendering (15 min)

#### Test 1.1: Initial Board Load
- **Objective**: Verify board renders correctly on first load
- **Steps**:
  1. Open Kanban view on base with 10 entries
  2. Observe: Columns appear with correct headers
  3. Observe: Column count badges show correct numbers
  4. Observe: Cards render with visible properties
  5. Check: No red errors in console

- **Expected Result**:
  - ✅ 3-5 columns visible (based on group property)
  - ✅ Count badges match entry count
  - ✅ Cards show title, status, and additional fields
  - ✅ Console is clean (no errors)

- **Performance Baseline**:
  - Initial render: < 100ms
  - Time to Interactive: < 500ms
  - No console errors or warnings

---

#### Test 1.2: Proper Data Display
- **Objective**: Verify all data types render correctly
- **Steps**:
  1. Examine cards in board
  2. Verify text fields display correctly
  3. Verify status/select fields show values
  4. Verify date fields appear properly formatted
  5. Verify null/empty values don't break rendering

- **Expected Result**:
  - ✅ All field types display without errors
  - ✅ Empty/null fields don't crash component
  - ✅ Long text truncates gracefully
  - ✅ Field labels are visible

---

#### Test 1.3: Column Headers & Counts
- **Objective**: Verify column structure and labeling
- **Steps**:
  1. Count visible columns
  2. Verify each column has a title
  3. Verify count badge shows correct number
  4. Verify drag handle is visible on column header
  5. Check header styling is consistent

- **Expected Result**:
  - ✅ Column headers show property values
  - ✅ Count badges are accurate
  - ✅ All headers have consistent styling
  - ✅ No broken layouts

---

### Section 2: Grouping & Data Integration (15 min)

#### Test 2.1: Group By Property Selection
- **Objective**: Verify grouping works with different properties
- **Steps**:
  1. Look for "Group by" control in view options
  2. Select different properties: status, priority, assignee
  3. Verify board regroups immediately
  4. Verify entries appear in correct columns
  5. Verify column counts update

- **Expected Result**:
  - ✅ Grouping updates dynamically
  - ✅ Entries move to correct columns
  - ✅ All entries appear in one of the columns
  - ✅ No entries are lost

---

#### Test 2.2: Filter Integration
- **Objective**: Verify filters apply correctly
- **Steps**:
  1. Apply a filter (e.g., status = "Done")
  2. Verify filtered entries appear on board
  3. Verify filtered-out entries don't appear
  4. Verify column counts reflect filtered data
  5. Clear filter and verify all entries return

- **Expected Result**:
  - ✅ Filters apply correctly
  - ✅ Columns show only matching entries
  - ✅ Counts update based on filter
  - ✅ Filter state persists

---

### Section 3: Virtual Scrolling & Performance (20 min)

#### Test 3.1: Load Test - 50 Items
- **Objective**: Verify smooth rendering with moderate load
- **Steps**:
  1. Create/load base with ~50 entries
  2. Open Kanban view
  3. Record render time in DevTools Performance tab
  4. Scroll through all items
  5. Check memory usage (DevTools Memory tab)

- **Expected Result**:
  - ✅ Render time: < 120ms
  - ✅ Scroll is smooth (no jank)
  - ✅ Memory usage: < 30MB

- **DevTools Steps**:
  1. Performance tab → Click Record
  2. Scroll through columns (2-3 seconds)
  3. Click Stop → Review metrics
  4. Look for "Paint" events every frame (60fps = 16.67ms apart)

---

#### Test 3.2: Load Test - 100 Items
- **Objective**: Verify performance with realistic dataset
- **Steps**:
  1. Create/load base with ~100 entries
  2. Open Kanban view
  3. Record render time (Performance tab)
  4. Scroll rapidly through large column
  5. Measure memory before/after (Memory tab)

- **Expected Result**:
  - ✅ Render time: < 150ms
  - ✅ Scroll: 60fps maintained
  - ✅ Memory: < 40MB, no growth after scrolling
  - ✅ Virtual scroller only renders visible items

- **Memory Check**:
  1. Memory tab → Take heap snapshot ("Snapshot 1")
  2. Scroll through all items
  3. Take another snapshot ("Snapshot 2")
  4. Compare: Should be similar size (no leak)

---

#### Test 3.3: Load Test - 500+ Items  
- **Objective**: Stress test with large dataset
- **Steps**:
  1. Create/load base with 500+ entries
  2. Open Kanban view
  3. Record render time
  4. Scroll heavily (20+ seconds of continuous scrolling)
  5. Check for memory leaks (3-4 snapshots)

- **Expected Result**:
  - ✅ Render time: < 250ms
  - ✅ Scroll remains smooth (occasional micro-jank acceptable)
  - ✅ Memory: < 50MB at all times
  - ✅ No memory growth on repeated scrolling

---

#### Test 3.4: Drag-Drop Performance
- **Objective**: Verify interactions don't cause lag
- **Steps**:
  1. With 100+ items loaded
  2. Drag a card from one column to another
  3. Observe drag animation smoothness
  4. Drop and verify placement
  5. Perform 5+ drag-drops in sequence
  6. Check Memory tab for leaks

- **Expected Result**:
  - ✅ Drag animation is smooth
  - ✅ No lag during drag operation
  - ✅ Drop placement is accurate
  - ✅ Memory stable after operations

---

### Section 4: Interaction Testing (15 min)

#### Test 4.1: Drag-Drop Functionality
- **Objective**: Verify cards move between columns
- **Steps**:
  1. Click and hold a card
  2. Drag to another column
  3. Observe visual feedback (highlight on hover)
  4. Release and observe card placement
  5. Verify card appears in new column
  6. Try drag-drop with 3+ different cards

- **Expected Result**:
  - ✅ Cards are draggable
  - ✅ Visual feedback visible during drag
  - ✅ Cards move to target column
  - ✅ Source column updates count
  - ✅ Target column updates count

---

#### Test 4.2: Column Reordering
- **Objective**: Verify columns can be reordered
- **Steps**:
  1. Hover over column header
  2. Click and hold on header
  3. Drag header left/right
  4. Observe visual feedback
  5. Release and observe new order
  6. Reload Obsidian (Cmd+R / Ctrl+R)
  7. Verify order persists

- **Expected Result**:
  - ✅ Column headers are draggable
  - ✅ Visual feedback shows drag target
  - ✅ Columns reorder visually
  - ✅ Order persists after reload

---

#### Test 4.3: Scroll Behavior
- **Objective**: Verify scrolling works smoothly
- **Steps**:
  1. In a column with 50+ items
  2. Scroll slowly (mouse wheel)
  3. Scroll rapidly (drag scrollbar)
  4. Scroll to top, then bottom
  5. Check that virtual scroller only renders visible items

- **Expected Result**:
  - ✅ Smooth scrolling with no jank
  - ✅ Items appear/disappear as viewport changes
  - ✅ Can reach top and bottom
  - ✅ Scroll position remembered per column

---

### Section 5: Error Handling & Edge Cases (15 min)

#### Test 5.1: Missing Data Handling
- **Objective**: Verify component handles missing data gracefully
- **Steps**:
  1. Create entry with missing property values
  2. Observe card rendering
  3. Try grouping by property that doesn't exist on entry
  4. Check console for errors

- **Expected Result**:
  - ✅ Cards display even with missing data
  - ✅ No console errors
  - ✅ Null/undefined values don't break layout
  - ✅ User message shown for missing data (if applicable)

---

#### Test 5.2: Invalid Property ID
- **Objective**: Verify component handles invalid property IDs
- **Steps**:
  1. Manually set group property to invalid ID (if possible)
  2. Observe board behavior
  3. Check console for errors

- **Expected Result**:
  - ✅ Component doesn't crash
  - ✅ Fallback behavior (default grouping)
  - ✅ Error message shown to user
  - ✅ Console shows debugging info

---

#### Test 5.3: Empty Columns
- **Objective**: Verify empty columns display correctly
- **Steps**:
  1. Create filter that leaves some columns empty
  2. Observe empty columns still appear
  3. Verify column count shows "0"
  4. Check that empty column can receive drag-drops

- **Expected Result**:
  - ✅ Empty columns display with headers
  - ✅ Count badge shows "0"
  - ✅ Can drop cards into empty column
  - ✅ Column expands as items added

---

### Section 6: Visual & UX (10 min)

#### Test 6.1: Visual Consistency
- **Objective**: Verify styling is consistent
- **Steps**:
  1. Observe column headers
  2. Observe card styling
  3. Check spacing and alignment
  4. Verify colors and fonts match Obsidian theme
  5. Check on both light and dark themes

- **Expected Result**:
  - ✅ Consistent styling across all cards
  - ✅ Consistent column header styling
  - ✅ Proper spacing and alignment
  - ✅ Respects Obsidian theme

---

#### Test 6.2: Accessibility Basics
- **Objective**: Verify basic accessibility
- **Steps**:
  1. Use keyboard Tab to navigate
  2. Verify focus indicators visible
  3. Check column headers are readable
  4. Verify text contrast is adequate
  5. Try without mouse (keyboard-only)

- **Expected Result**:
  - ✅ Keyboard navigation works
  - ✅ Focus indicators visible
  - ✅ Adequate color contrast
  - ✅ Screen reader can read content

---

### Section 7: Console Validation (5 min)

#### Test 7.1: Error Checking
- **Objective**: Verify no errors in console
- **Steps**:
  1. Open DevTools Console tab
  2. Filter for "Error" level
  3. Perform all interaction tests above
  4. Check for any red error messages
  5. Document any warnings

- **Expected Result**:
  - ✅ Zero errors in console
  - ✅ Warnings are expected/documented
  - ✅ No "[KanbanBasesView] Error" prefixed messages
  - ✅ Debug logs show [KanbanBasesView] prefix

---

---

## Performance Metrics Summary

### Acceptance Criteria

| Metric | Target | Measurement | Status |
|--------|--------|-------------|--------|
| Initial Render (10 items) | < 100ms | DevTools Performance | ✓ |
| Initial Render (100 items) | < 150ms | DevTools Performance | ✓ |
| Initial Render (500 items) | < 250ms | DevTools Performance | ✓ |
| Scroll FPS (60 target) | 60fps | DevTools Performance framerate | ✓ |
| Memory @ 10 items | < 25MB | DevTools Memory | ✓ |
| Memory @ 100 items | < 40MB | DevTools Memory | ✓ |
| Memory @ 500 items | < 50MB | DevTools Memory | ✓ |
| Memory Leak Test | No growth | Multiple heap snapshots | ✓ |
| Console Errors | 0 | DevTools Console | ✓ |

---

## Testing Results Template

### Test Date: _______
### Tester: _______
### Environment: Obsidian _______ on _______ (Mac/Windows/Linux)

### Section Results

**Section 1: Component Rendering**
- [ ] Test 1.1: ✓ Pass / ✗ Fail
- [ ] Test 1.2: ✓ Pass / ✗ Fail
- [ ] Test 1.3: ✓ Pass / ✗ Fail

**Section 2: Grouping & Data**
- [ ] Test 2.1: ✓ Pass / ✗ Fail
- [ ] Test 2.2: ✓ Pass / ✗ Fail

**Section 3: Performance**
- [ ] Test 3.1 (50 items): ✓ Pass / ✗ Fail
- [ ] Test 3.2 (100 items): ✓ Pass / ✗ Fail
- [ ] Test 3.3 (500+ items): ✓ Pass / ✗ Fail
- [ ] Test 3.4 (Drag-drop): ✓ Pass / ✗ Fail

**Section 4: Interactions**
- [ ] Test 4.1 (Drag-drop): ✓ Pass / ✗ Fail
- [ ] Test 4.2 (Column reorder): ✓ Pass / ✗ Fail
- [ ] Test 4.3 (Scroll): ✓ Pass / ✗ Fail

**Section 5: Error Handling**
- [ ] Test 5.1: ✓ Pass / ✗ Fail
- [ ] Test 5.2: ✓ Pass / ✗ Fail
- [ ] Test 5.3: ✓ Pass / ✗ Fail

**Section 6: Visual & UX**
- [ ] Test 6.1: ✓ Pass / ✗ Fail
- [ ] Test 6.2: ✓ Pass / ✗ Fail

**Section 7: Console**
- [ ] Test 7.1: ✓ Pass / ✗ Fail

### Overall Result: **✓ PASS** / **✗ FAIL**

### Issues Found:
```
1. [Severity] Issue description
2. [Severity] Issue description
```

### Notes:
```
Additional observations and recommendations
```

---

## Browser DevTools Quick Reference

### Performance Profiling
```
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to "Performance" tab
3. Click red record button
4. Perform action (load board, scroll)
5. Click stop
6. Review metrics:
   - First Paint (FP)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Time to Interactive (TTI)
```

### Memory Profiling
```
1. Open DevTools Memory tab
2. Click "Take heap snapshot"
3. Perform action (load, scroll, interact)
4. Take another snapshot
5. Compare heap snapshots:
   - Compare view shows what was allocated
   - Should be minimal difference
```

### Console Checking
```
1. Open DevTools Console tab
2. Filter for "Error" level (dropdown)
3. No red error messages should appear
4. Blue info/debug messages with [KanbanBasesView] prefix expected
```

---

## Sign-Off

- **Tester Name**: _______
- **Date**: _______
- **Overall Status**: ✓ Pass / ✗ Fail with notes
- **Approved by**: _______

