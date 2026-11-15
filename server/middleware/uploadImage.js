import multer from 'multer'
import { fileTypeFromBuffer } from 'file-type'
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from '../constants/index.js'

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
})

export async function validateUploadedImage(req, res, next) {
  if (!req.file) return next()

  if (!req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image file.',
    })
  }

  try {
    const detectedType = await fileTypeFromBuffer(req.file.buffer)

    if (!detectedType || !ALLOWED_IMAGE_TYPES.has(detectedType.mime)) {
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

export function singleImageUpload(fieldName) {
  return [uploadImage.single(fieldName), validateUploadedImage]
}
