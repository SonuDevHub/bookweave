import { API_URL, parseJsonSafe } from '../config/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bookweave_admin_token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const result = await parseJsonSafe(response)

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