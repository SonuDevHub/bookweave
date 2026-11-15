const TOKEN_KEY = 'bookweave_admin_token'
const ADMIN_KEY = 'bookweave_admin'

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}

export function setAdminSession(token, admin) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin || {}))
}

export function getAdminToken() {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw || raw === 'undefined' || raw === 'null') {
    if (raw !== null) clearAdminSession()
    return null
  }

  const token = raw.trim()
  const payload = decodeJwtPayload(token)

  if (!payload || typeof payload !== 'object') {
    clearAdminSession()
    return null
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
    clearAdminSession()
    return null
  }

  return token
}

export function getStoredAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || '{}')
  } catch {
    return {}
  }
}

export function isSafeAdminRedirect(pathname) {
  return (
    typeof pathname === 'string' &&
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/forgot-password')
  )
}

export function handleUnauthorizedAdmin() {
  clearAdminSession()

  if (
    typeof window !== 'undefined' &&
    isSafeAdminRedirect(window.location.pathname)
  ) {
    window.location.replace('/admin/login')
  }
}
