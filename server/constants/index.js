export const ENQUIRY_STATUSES = ['new', 'in-progress', 'contacted', 'closed']

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const CLOUDINARY_FOLDERS = {
  BOOKS: 'bookweave/books',
  AUTHORS: 'bookweave/authors',
}

export const STATIC_ASSET_EXT_RE = /\.(?:js|mjs|cjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|otf|json|xml|txt|pdf|webmanifest|wasm|html?)$/i
