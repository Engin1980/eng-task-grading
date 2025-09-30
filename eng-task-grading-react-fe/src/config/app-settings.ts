const AppSettings = {
  apiUrl: import.meta.env.VITE_API_URL,
  backendUrl: "https://localhost:55556/api",
  cloudflare: {
    enabled: false,
    siteKey: import.meta.env.VITE_CLOUDFLARE_SITE_KEY,
  },
  logLevel: "debug",
}

export default AppSettings