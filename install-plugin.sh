#!/bin/bash

# Install the Kanban Bases View plugin to Obsidian

PLUGIN_DIR="$HOME/Notes/.obsidian/plugins/obsidian-kanban-bases"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Installing Kanban Bases View plugin..."
echo "Project: $PROJECT_DIR"
echo "Destination: $PLUGIN_DIR"

# Create plugin directory
mkdir -p "$PLUGIN_DIR"

# Copy built files
cp "$PROJECT_DIR/main.js" "$PLUGIN_DIR/"
cp "$PROJECT_DIR/manifest.json" "$PLUGIN_DIR/"

# Verify installation
if [ -f "$PLUGIN_DIR/main.js" ] && [ -f "$PLUGIN_DIR/manifest.json" ]; then
    echo "✅ Plugin installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Reload Obsidian (Cmd+R or Ctrl+R)"
    echo "2. Open Settings > Community plugins > Installed plugins"
    echo "3. Look for 'Kanban Bases View' and enable it"
    echo "4. Create or open a Base file"
    echo "5. Click the view selector dropdown and choose 'Kanban'"
    ls -lh "$PLUGIN_DIR"
else
    echo "❌ Installation failed"
    exit 1
fi
