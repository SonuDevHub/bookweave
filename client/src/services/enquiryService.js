import { API_URL, parseJsonSafe } from '../config/api'
import { getAdminToken, handleUnauthorizedAdmin } from '../utils/adminAuth'

async function request(endpoint, options = {}) {
  const token = getAdminToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const result = await parseJsonSafe(response)

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedAdmin()
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed')
  }

  return result.data
}

export const getEnquiries = () => request('/enquiries')

export const updateEnquiryStatus = (id, status) =>
  request(`/enquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const deleteEnquiry = (id) =>
  request(`/enquiries/${id}`, {
    method: 'DELETE',
  })