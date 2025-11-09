#!/bin/bash

# Symlink plugin files to Obsidian vault
# This script creates symlinks from the project dist/ to the Obsidian plugin directory

VAULT_PATH_FILE=".notes/VAULT_PATH"

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

PLUGINS_DIR="$VAULT_PATH/.obsidian/plugins"
PLUGIN_LINK="$PLUGINS_DIR/KanbanBasesView"
PROJECT_ROOT="$(pwd)"

# Create plugins directory if it doesn't exist
mkdir -p "$PLUGINS_DIR"

# Remove old symlink if it exists
rm -f "$PLUGIN_LINK"

# Symlink dist folder to vault plugins as KanbanBasesView
ln -sf "$PROJECT_ROOT/dist" "$PLUGIN_LINK"

echo "✅ Symlinked dist/ to: $PLUGIN_LINK"
