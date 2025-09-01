// src/hooks/useLogger.ts
import { useCallback } from "react";
import { apiHttp } from "../services/api-http";

type LogLevel = "debug" | "info" | "warn" | "error";

export function useLogger() {
  const logToBackend = useCallback(async (level: LogLevel, message: string, meta?: any) => {
    try {
      await apiHttp.post("/logs", {
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // silently fail if logging backend is unreachable
    }
  }, []);

  const log = useCallback(
    (level: LogLevel, message: string, meta?: any) => {
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

      // log to backend
      if (level === "error") {
        logToBackend(level, message, meta);
      }
    },
    [logToBackend]
  );

  // convenience methods
  return {
    debug: (msg: string, meta?: any) => log("debug", msg, meta),
    info: (msg: string, meta?: any) => log("info", msg, meta),
    warn: (msg: string, meta?: any) => log("warn", msg, meta),
    error: (msg: string, meta?: any) => log("error", msg, meta),
  };
}
