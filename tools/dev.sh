#!/bin/bash

# Vault path configuration script
# This script ensures the vault path is configured before running development tasks

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT_PATH_FILE="$PROJECT_DIR/.notes/VAULT_PATH"

# Function to get vault path (with user prompt if needed)
get_vault_path() {
    # If file exists and points to valid path, use it
    if [ -f "$VAULT_PATH_FILE" ]; then
        VAULT_PATH=$(cat "$VAULT_PATH_FILE")
        if [ -d "$VAULT_PATH/.obsidian" ]; then
            return 0
        fi
    fi
    
    # File missing or path invalid - ask user
    echo "🔍 Obsidian vault not configured"
    echo ""
    echo "Enter the path to your Obsidian vault (the directory containing .obsidian/):"
    read -rp "Vault path: " VAULT_PATH
    
    # Validate path
    if [ ! -d "$VAULT_PATH" ]; then
        echo "❌ Directory doesn't exist: $VAULT_PATH"
        exit 1
    fi
    
    if [ ! -d "$VAULT_PATH/.obsidian" ]; then
        echo "❌ Not an Obsidian vault (no .obsidian directory): $VAULT_PATH"
        exit 1
    fi
    
    # Store the path
    mkdir -p "$PROJECT_DIR/.notes"
    echo "$VAULT_PATH" > "$VAULT_PATH_FILE"
    echo "✅ Vault path saved to .notes/VAULT_PATH"
    echo ""
}

get_vault_path
