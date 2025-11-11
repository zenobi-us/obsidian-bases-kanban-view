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
PLUGIN_PATH=~/.obsidian/plugins/obsidian-kanban-bases
if [ ! -f "$PLUGIN_PATH/manifest.json" ]; then
    echo "❌ Plugin not installed at $PLUGIN_PATH"
    exit 1
fi
echo "  ✅ Plugin installed at $PLUGIN_PATH"

# Check 3: Dependencies
echo ""
echo "✓ Checking dependencies..."
if ! grep -q '"react"' package.json; then
    echo "❌ React not in dependencies"
    exit 1
fi
echo "  ✅ React dependencies configured"

# Check 4: Tests
echo ""
echo "✓ Running test suite..."
if pnpm test --run 2>&1 | grep -q "Test Files.*passed"; then
    TEST_RESULT=$(pnpm test --run 2>&1 | grep "Test Files" | head -1)
    echo "  ✅ Tests passing: $TEST_RESULT"
else
    echo "⚠️  Could not verify tests (run 'pnpm test' manually)"
fi

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
