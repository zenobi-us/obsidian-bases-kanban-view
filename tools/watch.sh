#!/bin/bash

# Watch for source changes and rebuild
# This script watches src/ for changes and triggers rebuilds

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Watching for changes in src/"
echo "Press Ctrl+C to stop"
echo ""

# Watch for changes with polling (no external dependency)
last_hash=$(find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.css" \) -exec md5sum {} + | md5sum)

while true; do
    sleep 2
    current_hash=$(find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.css" \) -exec md5sum {} + | md5sum)
    
    if [ "$last_hash" != "$current_hash" ]; then
        echo "[$(date '+%H:%M:%S')] Changes detected, building..."
        
        if npm run build > /dev/null 2>&1; then
            echo "[$(date '+%H:%M:%S')] ✅ Built successfully"
        else
            echo "[$(date '+%H:%M:%S')] ❌ Build failed"
        fi
        
        last_hash=$current_hash
    fi
done
