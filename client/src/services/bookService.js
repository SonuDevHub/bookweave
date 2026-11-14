
import { API_URL, parseJsonSafe } from '../config/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bookweave_admin_token')

  const isFormData = options.body instanceof FormData

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const result = await parseJsonSafe(response)

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('bookweave_admin_token')
    localStorage.removeItem('bookweave_admin')
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login'
    }
  }

  if (!response.ok || !result.success) {
    const error = new Error(result.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }

  return result.data
}

// Get all books for admin
export const getAdminBooks = () => request('/books/admin')

// Get published books for public website
export const getPublishedBooks = () => request('/books')

// Create a new book
export const createBook = (bookData) => {
  const formData = new FormData()

  formData.append('title', bookData.title)
  formData.append('author', bookData.author)
  formData.append('genre', bookData.genre)
  formData.append('description', bookData.description)
  formData.append('coverImage', bookData.coverImage)

  return request('/books', {
    method: 'POST',
    body: formData,
  })
}

// Update an existing book
export const updateBook = (id, bookData) => {
  const formData = new FormData()

  formData.append('title', bookData.title)
  formData.append('author', bookData.author)
  formData.append('genre', bookData.genre)
  formData.append('description', bookData.description)

  if (bookData.coverImage) {
    formData.append('coverImage', bookData.coverImage)
  }

  return request(`/books/${id}`, {
    method: 'PATCH',
    body: formData,
  })
}

// Publish or unpublish a book
export const toggleBookPublish = (id) =>
  request(`/books/${id}/publish`, {
    method: 'PATCH',
  })

// Delete a book
export const deleteBook = (id) =>
  request(`/books/${id}`, {
    method: 'DELETE',
  })
