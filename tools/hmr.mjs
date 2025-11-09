#!/usr/bin/env node

/**
 * HMR (Hot Module Reload) watcher for development
 * Watches dist/ for changes and triggers Obsidian plugin reload via file change
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const vaultPathFile = path.join(projectRoot, '.notes', 'VAULT_PATH');

// Get vault path
if (!fs.existsSync(vaultPathFile)) {
  console.error('❌ Vault path not configured');
  process.exit(1);
}

const vaultPath = fs.readFileSync(vaultPathFile, 'utf-8').trim();
const pluginDir = path.join(vaultPath, '.obsidian', 'plugins', 'kanban-bases-view');

if (!fs.existsSync(pluginDir)) {
  console.error('❌ Plugin directory not found:', pluginDir);
  process.exit(1);
}

console.log('🔍 Watching dist/ for changes...');
console.log('📍 Vault:', vaultPath);
console.log('📍 Plugin dir:', pluginDir);
console.log('');

const touchFile = path.join(pluginDir, '.hmr-reload');
let watchTimeout;

fs.watch(distDir, { recursive: true }, (eventType, filename) => {
  // Debounce multiple events
  clearTimeout(watchTimeout);
  watchTimeout = setTimeout(() => {
    if (filename && !filename.includes('.map')) {
      console.log(`✅ Detected change: ${filename}`);
      
      // Touch a marker file to trigger plugin reload in Obsidian
      try {
        fs.writeFileSync(touchFile, new Date().toISOString());
        console.log('📌 Triggered plugin reload in Obsidian');
      } catch (err) {
        console.error('❌ Failed to trigger reload:', err.message);
      }
    }
  }, 300);
});
