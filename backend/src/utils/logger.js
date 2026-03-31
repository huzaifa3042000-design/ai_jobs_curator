const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LEVELS.INFO;

function fmt(level, msg, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level}] ${msg}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
  debug: (msg, meta) => currentLevel <= LEVELS.DEBUG && console.log(fmt('DEBUG', msg, meta)),
  info: (msg, meta) => currentLevel <= LEVELS.INFO && console.log(fmt('INFO', msg, meta)),
  warn: (msg, meta) => currentLevel <= LEVELS.WARN && console.warn(fmt('WARN', msg, meta)),
  error: (msg, meta) => currentLevel <= LEVELS.ERROR && console.error(fmt('ERROR', msg, meta)),
};
