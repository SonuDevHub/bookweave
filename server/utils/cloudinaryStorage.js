import { Readable } from 'stream'
import cloudinary from '../config/cloudinary.js'

export function uploadImage(file, folder) {
  if (!file || !file.buffer) {
    throw new Error('Image file buffer is required.')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        type: 'upload',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error.message)
          return reject(error)
        }

        if (!result || !result.secure_url || !result.public_id) {
          return reject(new Error('Cloudinary returned an invalid upload response.'))
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    Readable.from(file.buffer).pipe(uploadStream)
  })
}

export async function deleteImage(publicId) {
  if (!publicId) return

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'upload',
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.error('Cloudinary deletion warning:', result)
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message)
  }
}
