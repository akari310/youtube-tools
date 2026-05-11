// Centralized logging for YouTube Tools
// Usage: import { log, warn, error, debug } from '../utils/logger.js';

const PREFIX = '[YT Tools]';

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
let currentLevel = LEVELS.INFO;

export function setLogLevel(level) {
  if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
}

export function debug(...args) {
  if (currentLevel <= LEVELS.DEBUG) console.debug(PREFIX, ...args);
}

export function log(...args) {
  if (currentLevel <= LEVELS.INFO) console.log(PREFIX, ...args);
}

export function warn(...args) {
  if (currentLevel <= LEVELS.WARN) console.warn(PREFIX, ...args);
}

export function error(...args) {
  if (currentLevel <= LEVELS.ERROR) console.error(PREFIX, ...args);
}
