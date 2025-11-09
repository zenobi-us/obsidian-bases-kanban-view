#!/bin/bash

# Symlink plugin files to Obsidian vault
# This script creates symlinks from the project dist/ to the Obsidian plugin directory

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT_PATH_FILE="$PROJECT_DIR/.notes/VAULT_PATH"

# Check if vault path is configured
if [ ! -f "$VAULT_PATH_FILE" ]; then
    echo "❌ Vault path not configured. Run 'mise run setup-vault' first"
    exit 1
fi

VAULT_PATH=$(cat "$VAULT_PATH_FILE")

# Validate vault path still exists
if [ ! -d "$VAULT_PATH/.obsidian" ]; then
    echo "❌ Obsidian vault not found at: $VAULT_PATH"
    exit 1
fi

PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/obsidian-kanban-bases"

# Create plugin directory if it doesn't exist
mkdir -p "$PLUGIN_DIR"

# Remove old symlink/dist if it exists
rm -f "$PLUGIN_DIR/dist"

# Symlink the dist directory (force overwrite if it exists)
ln -sf "$PROJECT_DIR/dist" "$PLUGIN_DIR/dist"

# Copy manifest.json (non-symlinked, as it shouldn't change)
cp "$PROJECT_DIR/manifest.json" "$PLUGIN_DIR/"

echo "✅ Symlinked plugin to: $PLUGIN_DIR"
