#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');
const indexDtsPath = join(distDir, 'index.d.ts');

// Ensure types export is in the declaration file for CI
function ensureTypesExport() {
  if (existsSync(indexDtsPath)) {
    let content = readFileSync(indexDtsPath, 'utf8');
    
    // Check if types export already exists
    if (!content.includes("export * from './types';")) {
      // Add the types export
      content += "\nexport * from './types';\n";
      writeFileSync(indexDtsPath, content);
      console.log('✅ Added types export to declaration file');
    } else {
      console.log('✅ Types export already exists in declaration file');
    }
  } else {
    console.log('❌ Declaration file not found');
  }
}

ensureTypesExport(); 