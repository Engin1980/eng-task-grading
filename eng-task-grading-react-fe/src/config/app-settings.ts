// This module prefers runtime-injected configuration via `window.__APP_CONFIG__`.
// If that object isn't present, it falls back to compile-time values from `import.meta.env`.

type RawConfig = Record<string, string | boolean | undefined>

const runtimeConfig = (typeof window !== 'undefined' ? (window as any).__APP_CONFIG__ : undefined) as RawConfig | undefined

const getRaw = (key: string): string | boolean | undefined => {
  // 1) runtime-injected value (high priority)
  const r = runtimeConfig?.[key]
  if (r !== undefined) return r

  // 2) build-time (import.meta.env)
  return (import.meta.env as any)[key]
}

const coerceBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v
  if (v == null) return false
  const s = String(v).toLowerCase().trim()
  return s === 'true' || s === '1'
}

const AppSettings = {
  apiUrl: String(getRaw('VITE_API_URL') ?? ''),
  backendUrl: String(getRaw('VITE_BACKEND_URL') ?? getRaw('VITE_API_URL') ?? ''),
  cloudflare: {
    enabled: coerceBool(getRaw('VITE_CLOUDFLARE_ENABLED')),
    siteKey: String(getRaw('VITE_CLOUDFLARE_SITE_KEY') ?? ''),
  },
  logLevel: String(getRaw('VITE_LOG_LEVEL') ?? 'information'),
  presetLoginForm: coerceBool(getRaw('VITE_PRESET_LOGIN_FORM')),
}

export default AppSettings
