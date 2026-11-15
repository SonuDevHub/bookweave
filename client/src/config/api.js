const rawApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const normalizedUrl = rawApiUrl.trim().replace(/\/+$/, '')

// In Single-Domain Monolith mode, default to relative /api in both dev (Vite proxy) and production
export const API_URL = normalizedUrl
  ? normalizedUrl.endsWith('/api')
    ? normalizedUrl
    : `${normalizedUrl}/api`
  : '/api'

export async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}
