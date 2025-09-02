// src/hooks/useLogger.ts
import { useCallback } from "react";
import { logService } from "../services/log-service";

type LogLevel = "debug" | "info" | "warn" | "error";

export function useLogger() {
  const logToBackend = useCallback(async (level: LogLevel, message: string, meta?: any) => {
    await logService.logToBackend(level, message, meta);
  }, []);

  const log = useCallback(
    (level: LogLevel, message: string, meta?: any) => {
      logService.log(level, message, meta);
    },
    []
  );

  // convenience methods
  return {
    debug: (msg: string, meta?: any) => log("debug", msg, meta),
    info: (msg: string, meta?: any) => log("info", msg, meta),
    warn: (msg: string, meta?: any) => log("warn", msg, meta),
    error: (msg: string, meta?: any) => log("error", msg, meta),
    logToBackend, // expose for manual backend logging if needed
  };
}
