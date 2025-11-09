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

undefined
