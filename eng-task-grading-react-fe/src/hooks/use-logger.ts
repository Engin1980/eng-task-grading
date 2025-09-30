import { useMemo } from "react";
import { createLogger } from "../services/log-service";

export function useLogger(sender: string) {
  const logger = useMemo(() => createLogger(sender), [sender]);
  return logger;
}
