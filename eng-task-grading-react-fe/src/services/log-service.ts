import { apiHttp } from "./api-http";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: any;
  timestamp: string;
}

export const logService = {
  /**
   * Zaloguje zprávu do konzole a případně na backend
   */
  log: (level: LogLevel, message: string, meta?: any) => {
    if (meta == null || meta == undefined) meta = "";
    // log to console
    switch (level) {
      case "debug":
        console.debug(message, meta);
        break;
      case "info":
        console.info(message, meta);
        break;
      case "warn":
        console.warn(message, meta);
        break;
      case "error":
        console.error(message, meta);
        break;
    }

    // log to backend for errors
    if (level === "error") {
      // TODO logging to backend disabled
      //logService.logToBackend(level, message, meta);
    }
  },

  /**
   * Odešle log na backend server
   */
  logToBackend: async (level: LogLevel, message: string, meta?: any) => {
    try {
      await apiHttp.post("/logs", {
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
      } as LogEntry);
    } catch {
      // silently fail if logging backend is unreachable
    }
  },

  // convenience methods
  debug: (message: string, meta?: any) => logService.log("debug", message, meta),
  info: (message: string, meta?: any) => logService.log("info", message, meta),
  warn: (message: string, meta?: any) => logService.log("warn", message, meta),
  error: (message: string, meta?: any) => logService.log("error", message, meta),
};
