import Book from '../models/Book.js'
import { CLOUDINARY_FOLDERS } from '../constants/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { deleteImage, uploadImage } from '../utils/cloudinaryStorage.js'

export const getPublishedBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()

  return res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  })
})

export const getAdminBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 }).lean()

  return res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  })
})

export const createBook = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please upload a book cover.')
  }

  const uploadedImage = await uploadImage(req.file, CLOUDINARY_FOLDERS.BOOKS)

  try {
    const book = await Book.create({
      ...req.body,
      coverImage: uploadedImage,
      isPublished: false,
      publishedAt: null,
    })

    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      data: book,
    })
  } catch (error) {
    await deleteImage(uploadedImage.publicId)
    throw error
  }
})

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if (!book) {
    throw new AppError(404, 'Book not found.')
  }

  const oldPublicId = book.coverImage.publicId
  const uploadedImage = req.file
    ? await uploadImage(req.file, CLOUDINARY_FOLDERS.BOOKS)
    : null

  try {
    book.title = req.body.title
    book.author = req.body.author
    book.genre = req.body.genre
    book.description = req.body.description

    if (uploadedImage) {
      book.coverImage = uploadedImage
    }

    await book.save()
  } catch (error) {
    if (uploadedImage) {
      await deleteImage(uploadedImage.publicId)
    }
    throw error
  }

  if (uploadedImage && oldPublicId) {
    await deleteImage(oldPublicId)
  }

  return res.status(200).json({
    success: true,
    message: 'Book updated successfully.',
    data: book,
  })
})

export const toggleBookPublish = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if (!book) {
    throw new AppError(404, 'Book not found.')
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
})

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if (!book) {
    throw new AppError(404, 'Book not found.')
  }

  const publicId = book.coverImage.publicId
  await book.deleteOne()

  if (publicId) {
    await deleteImage(publicId)
  }

  return res.status(200).json({
    success: true,
    message: 'Book deleted successfully.',
  })
})
