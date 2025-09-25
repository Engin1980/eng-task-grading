const AppSettings = {
  apiUrl: import.meta.env.VITE_API_URL,
  cloudflare: {
    enabled: false,
    siteKey: import.meta.env.VITE_CLOUDFLARE_SITE_KEY,
  },
}

export default AppSettings