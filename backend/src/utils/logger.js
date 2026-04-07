const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
let currentLevel = LEVELS.INFO;

function resolveLevel(levelValue) {
  return LEVELS[levelValue?.toUpperCase()] ?? LEVELS.INFO;
}

export function initLogger(levelValue = process.env.LOG_LEVEL) {
  currentLevel = resolveLevel(levelValue);
  return currentLevel;
}

function serializeMeta(meta) {
  if (!meta) return meta;
  if (!(meta instanceof Error)) return meta;

  return {
    name: meta.name,
    message: meta.message,
    stack: meta.stack,
    ...(meta.cause ? { cause: meta.cause instanceof Error ? serializeMeta(meta.cause) : meta.cause } : {}),
  };
}

function fmt(level, msg, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level}] ${msg}`;
  const normalizedMeta = serializeMeta(meta);
  return normalizedMeta ? `${base} ${JSON.stringify(normalizedMeta)}` : base;
}

export const logger = {
  debug: (msg, meta) => currentLevel <= LEVELS.DEBUG && console.log(fmt('DEBUG', msg, meta)),
  info: (msg, meta) => currentLevel <= LEVELS.INFO && console.log(fmt('INFO', msg, meta)),
  warn: (msg, meta) => currentLevel <= LEVELS.WARN && console.warn(fmt('WARN', msg, meta)),
  error: (msg, meta) => currentLevel <= LEVELS.ERROR && console.error(fmt('ERROR', msg, meta)),
};