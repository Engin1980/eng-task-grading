import axios from "axios";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  sender: string;
  meta?: any;
  timestamp: string;
}

interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

// Privátní implementace logování
const logImplementation = (level: LogLevel, sender: string, message: string, meta?: any) => {
  if (meta == null || meta == undefined) meta = "";
  
  const fullMessage = `[${sender}] ${message}`;
  
  // log to console
  switch (level) {
    case "debug":
      console.log(`🐛 ${fullMessage}`, meta);
      break;
    case "info":
      console.info(fullMessage, meta);
      break;
    case "warn":
      console.warn(fullMessage, meta);
      break;
    case "error":
      console.error(fullMessage, meta);
      break;
  }

  // log to backend for errors
  if (level === "error") {
    // TODO logging to backend disabled
    //logToBackend(level, sender, message, meta);
  }
};

/**
 * Odešle log na backend server
 */
const logToBackend = async (level: LogLevel, sender: string, message: string, meta?: any) => {
  try {
    await axios.post("/api/logs", {
      level,
      message,
      sender,
      meta,
      timestamp: new Date().toISOString(),
    } as LogEntry);
  } catch {
    // silently fail if logging backend is unreachable
  }
};

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
