import AppSettings from "../config/app-settings";

export const LogLevels = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error"
} as const;
export type LogLevel = typeof LogLevels[keyof typeof LogLevels];

type SenderRule = {
  pattern: RegExp;
  level: LogLevel;
};

export class SenderRulesHandler {
  private rules: SenderRule[] = [];

  constructor() {
    this.loadFromStorage();
  }

  insertRule(pattern: string, level: LogLevel | string, index: number) {
    const logLevelLevel = parseLogLevel(level);
    this.rules.splice(index, 0, { pattern: new RegExp(pattern), level: logLevelLevel });
  }
  addRule(pattern: string, level: LogLevel | string) {
    const logLevelLevel = parseLogLevel(level);
    this.rules.push({ pattern: new RegExp(pattern), level: logLevelLevel });
  }
  deleteRule(pattern: string) {
    this.rules = this.rules.filter(rule => rule.pattern.source !== pattern);
  }
  deleteRuleAt(index: number) {
    if (index >= 0 && index < this.rules.length) {
      this.rules.splice(index, 1);
    }
  }
  getLevelForSender(sender: string, defaultLevel: LogLevel): LogLevel {
    for (const rule of this.rules) {
      if (rule.pattern.test(sender)) {
        return rule.level;
      }
    }
    return defaultLevel;
  }
  getRules(): SenderRule[] {
    return this.rules;
  }
  saveToStorage() {
    // save to local storage
    const serializedRules = this.rules.map(rule => ({
      pattern: rule.pattern.source,
      level: rule.level
    }));
    localStorage.setItem("logSenderRules", JSON.stringify(serializedRules));
  }
  loadFromStorage() {
    const data = localStorage.getItem("logSenderRules");
    if (data) {
      try {
        const parsedRules = JSON.parse(data);
        this.rules = parsedRules.map((rule: { pattern: string; level: string }) => ({
          pattern: new RegExp(rule.pattern),
          level: parseLogLevel(rule.level),
        }));
      } catch (error) {
        console.error("Failed to load log sender rules:", error);
      }
    }
  }
  deleteFromStorage() {
    localStorage.removeItem("logSenderRules");
  }
  clear() {
    this.rules = [];
  }
}

export function parseLogLevel(value: string, defaultLevel: LogLevel = LogLevels.info): LogLevel {
  if (!value) return defaultLevel;

  const normalized = value.toLowerCase();

  return Object.values(LogLevels).includes(normalized as LogLevel)
    ? (normalized as LogLevel)
    : defaultLevel;
}

const orderedLogLevels: LogLevel[] = [LogLevels.debug, LogLevels.info, LogLevels.warn, LogLevels.error];
const minimalLogLevel: LogLevel = (AppSettings.logLevel || "info") as LogLevel;
export const senderRulesHandler = new SenderRulesHandler();

interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

// Privátní implementace logování
const logImplementation = (level: LogLevel, sender: string, message: string, meta?: any) => {
  if (meta == null || meta == undefined) meta = "\t";

  const fullMessage = `[${sender}] ${message}`;

  if (!shouldBeLogged(sender, level)) return;

  // log to console
  switch (level) {
    case LogLevels.debug:
      console.log(`DEBUG\t ${fullMessage}`, meta);
      break;
    case LogLevels.info:
      console.info(`INFO\t ${fullMessage}`, meta);
      break;
    case LogLevels.warn:
      console.warn(`WARN\t ${fullMessage}`, meta);
      break;
    case LogLevels.error:
      console.error(`ERROR\t ${fullMessage}`, meta);
      break;
  }
};

const shouldBeLogged = (sender: string, level: LogLevel): boolean => {
  const senderLevel = senderRulesHandler.getLevelForSender(sender, minimalLogLevel);
  return orderedLogLevels.indexOf(level) >= orderedLogLevels.indexOf(senderLevel);
}

/**
 * Factory funkce pro vytvoření loggeru s daným senderem
 * @param sender Identifikace odesilatele (název komponenty/služby)
 * @returns Logger instance s pevně nastaveným senderem
 */
export const createLogger = (sender: string): Logger => {
  return {
    debug: (message: string, meta?: any) => logImplementation(LogLevels.debug, sender, message, meta),
    info: (message: string, meta?: any) => logImplementation(LogLevels.info, sender, message, meta),
    warn: (message: string, meta?: any) => logImplementation(LogLevels.warn, sender, message, meta),
    error: (message: string, meta?: any) => logImplementation(LogLevels.error, sender, message, meta),
  };
};

// Globální logger pro zpětnou kompatibilitu (ale doporučujeme používat createLogger)
export const logService = createLogger("Global");
