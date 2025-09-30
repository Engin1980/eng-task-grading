import AppSettings from "../config/app-settings";

type LogLevel = "debug" | "info" | "warn" | "error";
const minimalLogLevel: LogLevel = (AppSettings.logLevel || "info") as LogLevel;

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

  if (!shouldBeLogged(level)) return;

  // log to console
  switch (level) {
    case "debug":
      console.log(`DEBUG\t ${fullMessage}`, meta);
      break;
    case "info":
      console.info(`INFO\t ${fullMessage}`, meta);
      break;
    case "warn":
      console.warn(`WARN\t ${fullMessage}`, meta);
      break;
    case "error":
      console.error(`ERROR\t ${fullMessage}`, meta);
      break;
  }
};

const shouldBeLogged = (level: LogLevel): boolean => {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  return levels.indexOf(level) >= levels.indexOf(minimalLogLevel);
}

/**
 * Factory funkce pro vytvoření loggeru s daným senderem
 * @param sender Identifikace odesilatele (název komponenty/služby)
 * @returns Logger instance s pevně nastaveným senderem
 */
export const createLogger = (sender: string): Logger => {
  return {
    debug: (message: string, meta?: any) => logImplementation("debug", sender, message, meta),
    info: (message: string, meta?: any) => logImplementation("info", sender, message, meta),
    warn: (message: string, meta?: any) => logImplementation("warn", sender, message, meta),
    error: (message: string, meta?: any) => logImplementation("error", sender, message, meta),
  };
};

// Globální logger pro zpětnou kompatibilitu (ale doporučujeme používat createLogger)
export const logService = createLogger("Global");
