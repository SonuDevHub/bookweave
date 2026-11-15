import Author from '../models/Author.js'
import Book from '../models/Book.js'
import { CLOUDINARY_FOLDERS } from '../constants/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { escapeRegex } from '../utils/validators.js'
import { deleteImage, uploadImage } from '../utils/cloudinaryStorage.js'

async function isDuplicateName(name, excludeId = null) {
  const query = {
    name: {
      $regex: `^${escapeRegex(name)}$`,
      $options: 'i',
    },
    isDeleted: { $ne: true },
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  return Boolean(await Author.exists(query))
}

async function syncAuthorsFromBooks() {
  const [bookAuthors, existingAuthors] = await Promise.all([
    Book.distinct('author'),
    Author.find({}, 'name').lean(),
  ])

  const existingNames = new Set(
    existingAuthors.map((author) => author.name.toLowerCase())
  )

  const missingAuthors = []
  const queuedNames = new Set()

  for (const rawName of bookAuthors) {
    const cleanName = typeof rawName === 'string' ? rawName.trim() : ''
    if (!cleanName) continue

    const key = cleanName.toLowerCase()
    if (existingNames.has(key) || queuedNames.has(key)) continue

    queuedNames.add(key)
    missingAuthors.push({
      name: cleanName,
      designation: '',
      bio: '',
      profileImage: { url: '', publicId: '' },
    })
  }

  if (missingAuthors.length > 0) {
    await Author.insertMany(missingAuthors)
  }
}

async function attachBookCounts(authors) {
  const counts = await Book.aggregate([
    {
      $group: {
        _id: { $toLower: '$author' },
        count: { $sum: 1 },
      },
    },
  ])

  const countMap = new Map(counts.map((item) => [item._id, item.count]))

  return authors.map((author) => ({
    ...author,
    bookCount: countMap.get(author.name.toLowerCase()) || 0,
  }))
}

async function listActiveAuthorsWithCounts() {
  await syncAuthorsFromBooks()

  const authors = await Author.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean()

  return attachBookCounts(authors)
}

export const getAuthors = asyncHandler(async (req, res) => {
  const data = await listActiveAuthorsWithCounts()

  return res.status(200).json({
    success: true,
    count: data.length,
    data,
  })
})

export const getAdminAuthors = asyncHandler(async (req, res) => {
  const data = await listActiveAuthorsWithCounts()

  return res.status(200).json({
    success: true,
    count: data.length,
    data,
  })
})

export const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio, designation } = req.body

  if (!req.file) {
    throw new AppError(400, 'Please upload an author profile photo.')
  }

  if (await isDuplicateName(name)) {
    throw new AppError(409, 'An author with this name already exists.')
  }

  const uploadedImage = await uploadImage(req.file, CLOUDINARY_FOLDERS.AUTHORS)

  try {
    const [author, bookCount] = await Promise.all([
      Author.create({
        name,
        designation,
        bio,
        profileImage: uploadedImage,
      }),
      Book.countDocuments({ author: name }),
    ])

    return res.status(201).json({
      success: true,
      message: 'Author created successfully.',
      data: {
        ...author.toObject(),
        bookCount,
      },
    })
  } catch (error) {
    await deleteImage(uploadedImage.publicId)
    throw error
  }
})

export const updateAuthor = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, bio, designation } = req.body

  const author = await Author.findOne({ _id: id, isDeleted: { $ne: true } })
  if (!author) {
    throw new AppError(404, 'Author not found.')
  }

  if (await isDuplicateName(name, id)) {
    throw new AppError(409, 'Another author with this name already exists.')
  }

  const oldName = author.name
  const oldPublicId = author.profileImage.publicId
  const uploadedImage = req.file
    ? await uploadImage(req.file, CLOUDINARY_FOLDERS.AUTHORS)
    : null

  try {
    author.name = name
    if (designation !== undefined) author.designation = designation
    if (bio !== undefined) author.bio = bio
    if (uploadedImage) author.profileImage = uploadedImage

    await author.save()

    if (oldName !== author.name) {
      await Book.updateMany({ author: oldName }, { $set: { author: author.name } })
    }
  } catch (error) {
    if (uploadedImage) {
      await deleteImage(uploadedImage.publicId)
    }
    throw error
  }

  if (uploadedImage && oldPublicId) {
    await deleteImage(oldPublicId)
  }

  const bookCount = await Book.countDocuments({ author: author.name })

  return res.status(200).json({
    success: true,
    message: 'Author updated successfully.',
    data: {
      ...author.toObject(),
      bookCount,
    },
  })
})

export const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
  })
  if (!author) {
    throw new AppError(404, 'Author not found.')
  }

  const publicId = author.profileImage.publicId

  author.isDeleted = true
  await author.save()

  if (publicId) {
    await deleteImage(publicId)
  }

  return res.status(200).json({
    success: true,
    message: 'Author deleted successfully.',
  })
})
