
import multer from 'multer'
import { fileTypeFromBuffer } from 'file-type'

const storage = multer.memoryStorage()

const uploadBookCover = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const validateBookCover = async (req, res, next) => {
  if (!req.file) return next()

  try {
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file.',
      })
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer)

    if (!detectedType || !allowedTypes.has(detectedType.mime)) {
      return res.status(400).json({
        success: false,
        message: 'Only valid JPEG, PNG and WebP images are allowed.',
      })
    }

    req.file.mimetype = detectedType.mime

    return next()
  } catch (error) {
    console.error('Image validation error:', error.message)

    return res.status(400).json({
      success: false,
      message: 'Unable to validate image file.',
    })
  }
}

export default uploadBookCover
