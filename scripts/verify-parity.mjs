import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'script.js');
const legacyPath = resolve(root, 'src/legacy-full.js');
const distPath = resolve(root, 'dist/youtube-tools-userscript.user.js');

const requiredRuntimeMarkers = [
  'function addIcon',
  'function applySettings',
  'function buildYTMToolbar',
  'function renderizarButtons',
  'function toggleCinematicLighting',
  'function startDownloadVideoOrAudio',
  'function setupShortsChannelNameFeature',
  'function setupLockupCachedStats',
];

function readText(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

function stripUserscriptHeader(source) {
  return source.replace(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n*/, '');
}

function unwrapIIFE(source) {
  let s = source.trim();
  s = s.replace(/^\s*\(function\s*\(\s*\)\s*\{/, '');
  s = s.replace(/\s*\}\)\s*\(\s*\)\s*;?\s*$/, '');
  s = s
    .split('\n')
    .map(line => line.replace(/^ {2}/, ''))
    .join('\n');
  return s.trim();
}

function fail(message) {
  console.error(`[verify:parity] ${message}`);
  process.exitCode = 1;
}

const sourceStripped = unwrapIIFE(stripUserscriptHeader(readText(sourcePath))).trim();
const legacySource = readText(legacyPath).trim();

if (sourceStripped !== legacySource) {
  fail('src/legacy-full.js is out of sync with script.js. Run npm run sync:legacy.');
} else {
  console.log('[verify:parity] legacy source matches script.js.');
}

let distSource = '';
try {
  distSource = readText(distPath);
} catch {
  fail('dist/youtube-tools-userscript.user.js is missing. Run npm run build first.');
}

if (distSource) {
  const missingMarkers = requiredRuntimeMarkers.filter(marker => !distSource.includes(marker));
  if (missingMarkers.length > 0) {
    fail(`dist bundle is missing expected runtime markers: ${missingMarkers.join(', ')}`);
  } else {
    console.log('[verify:parity] dist bundle contains expected full runtime markers.');
  }
}
