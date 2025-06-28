#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');

function fixExtensions(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      fixExtensions(filePath);
    } else if (file.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf8');

      // Fix relative imports - add .js extension
      content = content.replace(
        /from ['"](\.[^'"]*?)['"];/g,
        (match, importPath) => {
          if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
            return match;
          }
          return match.replace(importPath, importPath + '.js');
        }
      );

      // Fix export statements
      content = content.replace(
        /export \* from ['"](\.[^'"]*?)['"];/g,
        (match, importPath) => {
          if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
            return match;
          }
          return match.replace(importPath, importPath + '.js');
        }
      );

      writeFileSync(filePath, content);
    }
  }
}

// Check if dist directory exists before trying to process it
if (existsSync(distDir)) {
  fixExtensions(distDir);
} else {
  console.log('Dist directory does not exist, skipping extension fixes');
} 