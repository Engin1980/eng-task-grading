const AppSettings = {
  // Vite only exposes env variables that start with VITE_ to client code.
  // Use sensible fallbacks so the app doesn't break when a var is missing.
  apiUrl: (import.meta.env.VITE_API_URL as string) ?? '',
  // Keep a separate backend URL; fall back to VITE_API_URL if not provided.
  backendUrl: (import.meta.env.VITE_BACKEND_URL as string) ?? (import.meta.env.VITE_API_URL as string) ?? '',
  cloudflare: {
    // env vars are strings — coerce 'true'/'false' to boolean.
    enabled: (import.meta.env.VITE_CLOUDFLARE_ENABLED as string) === 'true',
    siteKey: (import.meta.env.VITE_CLOUDFLARE_SITE_KEY as string) ?? '',
  },
  logLevel: (import.meta.env.VITE_LOG_LEVEL as string) ?? 'debug',
}

export default AppSettings