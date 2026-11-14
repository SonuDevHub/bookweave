
import mongoose from 'mongoose'
import { Readable } from 'stream'
import Book from '../models/Book.js'
import cloudinary from '../config/cloudinary.js'

const BOOK_FOLDER = 'bookweave/books'

async function uploadToCloudinary(file) {
  if (!file?.buffer) {
    throw new Error('Book cover image is required.')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: BOOK_FOLDER,
        resource_type: 'image',
        type: 'upload',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            details: error.error?.message,
          })

          return reject(error)
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error('Cloudinary returned an invalid upload response.'))
        }

        resolve(result)
      }
    )

    Readable.from(file.buffer).pipe(uploadStream)
  })
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId) return

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'upload',
    })

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.error('Cloudinary image deletion warning:', result)
    }
  } catch (error) {
    console.error('Cloudinary image deletion error:', error.message)
  }
}

function validateBookFields({ title, author, genre, description }) {
  return [title, author, genre, description].every(
    (value) => typeof value === 'string' && value.trim()
  )
}

// Get published books
export const getPublishedBooks = async (req, res) => {
  try {
    const books = await Book.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    })
  } catch (error) {
    console.error('Get published books error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch published books.',
    })
  }
}

// Get all books for admin
export const getAdminBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    })
  } catch (error) {
    console.error('Get admin books error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch books.',
    })
  }
}

// Create book
export const createBook = async (req, res) => {
  let uploadedImage = null

  try {
    const { title, author, genre, description } = req.body

    if (!validateBookFields({ title, author, genre, description })) {
      return res.status(400).json({
        success: false,
        message: 'All book fields are required.',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a book cover.',
      })
    }

    uploadedImage = await uploadToCloudinary(req.file)

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      description: description.trim(),
      coverImage: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
      isPublished: false,
      publishedAt: null,
    })

    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      data: book,
    })
  } catch (error) {
    console.error('Create book error:', error.message)

    if (uploadedImage?.public_id) {
      await deleteCloudinaryImage(uploadedImage.public_id)
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to create book.',
    })
  }
}

// Update book
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params
    const { title, author, genre, description } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID.',
      })
    }

    if (!validateBookFields({ title, author, genre, description })) {
      return res.status(400).json({
        success: false,
        message: 'All book fields are required.',
      })
    }

    const book = await Book.findById(id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      })
    }

    let uploadedImage = null
    const oldPublicId = book.coverImage?.publicId

    try {
      if (req.file) {
        uploadedImage = await uploadToCloudinary(req.file)
      }

      book.title = title.trim()
      book.author = author.trim()
      book.genre = genre.trim()
      book.description = description.trim()

      if (uploadedImage) {
        book.coverImage = {
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
        }
      }

      await book.save()

      if (uploadedImage && oldPublicId) {
        await deleteCloudinaryImage(oldPublicId)
      }

      return res.status(200).json({
        success: true,
        message: 'Book updated successfully.',
        data: book,
      })
    } catch (error) {
      if (uploadedImage?.public_id) {
        await deleteCloudinaryImage(uploadedImage.public_id)
      }

      throw error
    }
  } catch (error) {
    console.error('Update book error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update book.',
    })
  }
}

// Toggle publish status
export const toggleBookPublish = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID.',
      })
    }

    const book = await Book.findById(id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      })
    }

    book.isPublished = !book.isPublished
    book.publishedAt = book.isPublished ? new Date() : null

    await book.save()

    return res.status(200).json({
      success: true,
      message: book.isPublished
        ? 'Book published successfully.'
        : 'Book unpublished successfully.',
      data: book,
    })
  } catch (error) {
    console.error('Toggle book publish error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update publishing status.',
    })
  }
}

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID.',
      })
    }

    const book = await Book.findById(id)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      })
    }

    const publicId = book.coverImage?.publicId

    await book.deleteOne()

    if (publicId) {
      await deleteCloudinaryImage(publicId)
    }

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
    })
  } catch (error) {
    console.error('Delete book error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete book.',
    })
  }
}
