#!/bin/bash

# Development installation script: rebuilds and auto-installs on changes

PLUGIN_DIR="$HOME/Notes/.obsidian/plugins/obsidian-kanban-bases"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Kanban Bases View - Development Mode"
echo "Watching for changes and auto-installing to Obsidian..."
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Function to build and install
build_and_install() {
    echo "[$(date '+%H:%M:%S')] Building..."
    cd "$PROJECT_DIR"
    
    if npm run build > /dev/null 2>&1; then
        cp "$PROJECT_DIR/main.js" "$PLUGIN_DIR/"
        echo "[$(date '+%H:%M:%S')] ✅ Built and installed. Reload Obsidian to test (Cmd+R or Ctrl+R)"
    else
        echo "[$(date '+%H:%M:%S')] ❌ Build failed. Check npm run build output"
    fi
}

# Initial build
build_and_install

# Watch for changes (requires `watch` command)
if command -v watch &> /dev/null; then
    # Watch src directory for changes
    find "$PROJECT_DIR/src" -type f -name "*.ts" -o -name "*.css" | while read file; do
        echo "Watching: $file"
    done
    
    # Simple polling loop (no external dependency)
    last_hash=$(find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.css" \) -exec md5sum {} + | md5sum)
    
    while true; do
        sleep 2
        current_hash=$(find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.css" \) -exec md5sum {} + | md5sum)
        
        if [ "$last_hash" != "$current_hash" ]; then
            build_and_install
            last_hash=$current_hash
        fi
    done
else
    echo "For auto-rebuild on changes, run: npm run dev"
fi
