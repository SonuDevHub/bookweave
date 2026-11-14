import { API_URL, parseJsonSafe } from '../config/api'

async function authorRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bookweave_admin_token')

  const response = await fetch(`${API_URL}/authors${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const result = await parseJsonSafe(response)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('bookweave_admin_token')
      localStorage.removeItem('bookweave_admin')
      window.location.href = '/admin/login'
    }

    throw new Error(result.message || 'Something went wrong.')
  }

  return result
}

export const getAdminAuthors = () =>
  authorRequest('/admin')

export const createAuthor = (formData) =>
  authorRequest('/', {
    method: 'POST',
    body: formData,
  })

export const updateAuthor = (id, formData) =>
  authorRequest(`/${id}`, {
    method: 'PATCH',
    body: formData,
  })

export const deleteAuthor = (id) =>
  authorRequest(`/${id}`, {
    method: 'DELETE',
  })