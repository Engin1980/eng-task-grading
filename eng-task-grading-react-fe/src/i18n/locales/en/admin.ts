import type { admin as cs } from "../cs/admin";

export const admin: typeof cs = {
  logs: {
    loadError: "Error while loading logs",
    loading: "Loading logs, this may take a while...",
    title: "Application logs",
    confirmDeleteAll: "Do you really want to delete all logs? This action cannot be undone.",
    confirmDeleteOld: "Do you really want to delete old logs? This action cannot be undone.",
    search: "Search in the log",
    searchPlaceholder: "Search in the message, template, properties...",
    level: "Log level",
    allLevels: "All levels",
    reload: "Reload",
    deleteOld: "Delete old",
    deleteAll: "Delete all",
    textChip: "Text: \"{{filter}}\"",
    levelChip: "Level: {{level}}",
    shown: "Displayed records",
    total: "Total records",
    errors: "Errors",
    warnings: "Warnings",
    noMatch: "No logs match the filter.",
    empty: "No logs are available.",
    columns: { time: "Time", level: "Level", source: "Source", message: "Message" },
  },
  logDetail: {
    first: "To the start",
    back: "Back",
    next: "Next",
  },
  clientLogs: {
    saved: "Saved",
  },
};
