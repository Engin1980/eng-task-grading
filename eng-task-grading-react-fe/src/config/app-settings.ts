const AppSettings = {
  apiUrl: import.meta.env.VITE_API_URL,
  backendUrl: import.meta.env.BACKEND_URL,
  cloudflare: {
    enabled: import.meta.env.CLOUDFLARE_ENABLED,
    siteKey: import.meta.env.VITE_CLOUDFLARE_SITE_KEY,
  },
  logLevel: "debug",
}

export default AppSettings