import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// DISABLED: legacy-full.js is being phased out in favor of modular src/features/
process.exit(0);

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'script.js');
const legacyPath = resolve(root, 'src/legacy-full.js');

function stripUserscriptHeader(source) {
  return source.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\r?\n*/, '');
}

function unwrapIIFE(source) {
  // Remove the outer (function () { ... })(); wrapper
  // The IIFE starts with "(function () {" (possibly with newlines)
  // and ends with "})();" at the very end
  let s = source.trim();

  // Remove leading IIFE start
  s = s.replace(/^\s*\(function\s*\(\s*\)\s*\{/, '');

  // Remove trailing IIFE end: "})();" at the end (possibly with preceding whitespace/newlines)
  s = s.replace(/\s*\}\)\s*\(\s*\)\s*;?\s*$/, '');

  // Unindent: remove 2 spaces from the start of every line (IIFE body was indented)
  s = s
    .split('\n')
    .map(line => line.replace(/^ {2}/, ''))
    .join('\n');

  return s.trim() + '\n';
}

let source = readFileSync(sourcePath, 'utf8');
source = stripUserscriptHeader(source);
source = unwrapIIFE(source);

writeFileSync(legacyPath, source);
console.log('[sync:legacy] src/legacy-full.js synced from script.js (IIFE removed).');
