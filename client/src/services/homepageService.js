
import { API_URL, parseJsonSafe } from '../config/api'

async function request(path) {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return parseJsonSafe(response)
}

// Fetch featured books when the backend is configured
export async function getFeaturedBooks() {
  return request('/books/featured')
}

// Fetch publishing services when the backend is configured
export async function getPublishingServices() {
  return request('/services')
}
