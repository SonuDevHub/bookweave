
import mongoose from 'mongoose'
import { Readable } from 'stream'
import Author from '../models/Author.js'
import Book from '../models/Book.js'
import cloudinary from '../config/cloudinary.js'

const AUTHOR_FOLDER = 'bookweave/authors'

// Escape regex special characters
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Upload author photo
async function uploadToCloudinary(file) {
  if (!file?.buffer) {
    throw new Error('Author profile photo is required.')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: AUTHOR_FOLDER,
        resource_type: 'image',
        type: 'upload',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary author upload error:', error.message)
          return reject(error)
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error('Invalid Cloudinary response.'))
        }

        resolve(result)
      }
    )

    Readable.from(file.buffer).pipe(uploadStream)
  })
}

// Delete author photo
async function deleteCloudinaryImage(publicId) {
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

// Find duplicate active author
async function isDuplicateName(name, excludeId = null) {
  const query = {
    name: {
      $regex: `^${escapeRegex(name.trim())}$`,
      $options: 'i',
    },
    isDeleted: { $ne: true },
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  return Author.exists(query)
}

// Validate author fields
function validateAuthorFields({ name, bio, designation }, requireBio = false) {
  const validName =
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.trim().length <= 100

  const validBio =
    bio === undefined ||
    (
      typeof bio === 'string' &&
      bio.trim().length <= 2000
    )

  const requiredBioValid =
    !requireBio ||
    (
      typeof bio === 'string' &&
      bio.trim().length > 0
    )

  const validDesignation =
    designation === undefined ||
    (
      typeof designation === 'string' &&
      designation.trim().length <= 100
    )

  return validName && validBio && requiredBioValid && validDesignation
}

// Sync existing Book authors into Author collection
async function syncAuthorsFromBooks() {
  const bookAuthors = await Book.distinct('author')

  for (const rawName of bookAuthors) {
    const name = typeof rawName === 'string' ? rawName.trim() : ''

    if (!name) continue

    const existing = await Author.findOne({
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: 'i',
      },
    })

    // Includes deleted records to prevent deleted authors reappearing
    if (existing) continue

    await Author.create({
      name,
      designation: '',
      bio: '',
      profileImage: {
        url: '',
        publicId: '',
      },
    })
  }
}

// Attach book counts
async function attachBookCounts(authors) {
  const counts = await Book.aggregate([
    {
      $group: {
        _id: { $toLower: '$author' },
        count: { $sum: 1 },
      },
    },
  ])

  const countMap = new Map(
    counts.map((item) => [item._id, item.count])
  )

  return authors.map((author) => ({
    ...author,
    bookCount: countMap.get(author.name?.toLowerCase()) || 0,
  }))
}

// Get public authors
export const getAuthors = async (req, res) => {
  try {
    await syncAuthorsFromBooks()

    const authors = await Author.find({
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean()

    const data = await attachBookCounts(authors)

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Get authors error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch authors.',
    })
  }
}

// Get all authors for admin
export const getAdminAuthors = async (req, res) => {
  try {
    await syncAuthorsFromBooks()

    const authors = await Author.find({
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean()

    const data = await attachBookCounts(authors)

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Get admin authors error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch authors.',
    })
  }
}

// Create author
export const createAuthor = async (req, res) => {
  let uploadedImage = null

  try {
    const { name, bio, designation = '' } = req.body

    if (!validateAuthorFields({ name, bio, designation }, true)) {
      return res.status(400).json({
        success: false,
        message: 'Valid author name and bio are required.',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an author profile photo.',
      })
    }

    if (await isDuplicateName(name)) {
      return res.status(409).json({
        success: false,
        message: 'An author with this name already exists.',
      })
    }

    uploadedImage = await uploadToCloudinary(req.file)

    const author = await Author.create({
      name: name.trim(),
      designation: designation.trim(),
      bio: bio.trim(),
      profileImage: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Author created successfully.',
      data: {
        ...author.toObject(),
        bookCount: await Book.countDocuments({
          author: author.name,
        }),
      },
    })
  } catch (error) {
    console.error('Create author error:', error.message)

    if (uploadedImage?.public_id) {
      await deleteCloudinaryImage(uploadedImage.public_id)
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to create author.',
    })
  }
}

// Update author
export const updateAuthor = async (req, res) => {
  let uploadedImage = null

  try {
    const { id } = req.params
    const { name, bio, designation } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid author ID.',
      })
    }

    if (!validateAuthorFields({ name, bio, designation })) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid author details.',
      })
    }

    const author = await Author.findOne({
      _id: id,
      isDeleted: { $ne: true },
    })

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found.',
      })
    }

    if (await isDuplicateName(name, id)) {
      return res.status(409).json({
        success: false,
        message: 'Another author with this name already exists.',
      })
    }

    const oldName = author.name
    const oldPublicId = author.profileImage?.publicId

    if (req.file) {
      uploadedImage = await uploadToCloudinary(req.file)
    }

    author.name = name.trim()

    if (designation !== undefined) {
      author.designation = designation.trim()
    }

    if (bio !== undefined) {
      author.bio = bio.trim()
    }

    if (uploadedImage) {
      author.profileImage = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      }
    }

    await author.save()

    // Keep existing books linked after an author rename
    if (oldName !== author.name) {
      await Book.updateMany(
        { author: oldName },
        { $set: { author: author.name } }
      )
    }

    if (uploadedImage && oldPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    const bookCount = await Book.countDocuments({
      author: author.name,
    })

    return res.status(200).json({
      success: true,
      message: 'Author updated successfully.',
      data: {
        ...author.toObject(),
        bookCount,
      },
    })
  } catch (error) {
    console.error('Update author error:', error.message)

    if (uploadedImage?.public_id) {
      await deleteCloudinaryImage(uploadedImage.public_id)
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to update author.',
    })
  }
}

// Delete author without deleting books
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid author ID.',
      })
    }

    const author = await Author.findOne({
      _id: id,
      isDeleted: { $ne: true },
    })

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found.',
      })
    }

    const publicId = author.profileImage?.publicId

    // Soft delete prevents automatic re-import from existing books
    author.isDeleted = true
    await author.save()

    if (publicId) {
      await deleteCloudinaryImage(publicId)
    }

    return res.status(200).json({
      success: true,
      message: 'Author deleted successfully.',
    })
  } catch (error) {
    console.error('Delete author error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete author.',
    })
  }
}
