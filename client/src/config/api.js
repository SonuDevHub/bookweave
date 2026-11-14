const rawApiUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const normalizedUrl = rawApiUrl.trim().replace(/\/+$/, '')

export const API_URL = normalizedUrl
  ? normalizedUrl.endsWith('/api')
    ? normalizedUrl
    : `${normalizedUrl}/api`
  : import.meta.env.DEV
    ? 'http://localhost:5000/api'
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
