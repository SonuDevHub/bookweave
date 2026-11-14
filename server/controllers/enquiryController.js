
import Enquiry from '../models/Enquiry.js'
import mongoose from 'mongoose'
import { sendEnquiryEmails } from '../utils/emailService.js'

const allowedStatuses = [
  'new',
  'in-progress',
  'contacted',
  'closed',
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const optionalString = (value, maxLength) => {
  if (value === undefined || value === null || value === '') {
    return { valid: true, value: undefined }
  }

  if (typeof value !== 'string') {
    return { valid: false }
  }

  const trimmed = value.trim()

  if (trimmed.length > maxLength) {
    return { valid: false }
  }

  return { valid: true, value: trimmed }
}

// Create a new enquiry
export async function createEnquiry(req, res) {
  try {
    const {
      authorName,
      email,
      phone,
      bookTitle,
      genre,
      manuscriptStatus,
      services,
      message,
    } = req.body || {}

    if (
      typeof authorName !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !authorName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required.',
      })
    }

    const cleanName = authorName.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanMessage = message.trim()

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 100 characters.',
      })
    }

    if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 5000 characters.',
      })
    }

    const optionalFields = {
      phone: optionalString(phone, 30),
      bookTitle: optionalString(bookTitle, 150),
      genre: optionalString(genre, 80),
      manuscriptStatus: optionalString(manuscriptStatus, 80),
    }

    for (const field of Object.values(optionalFields)) {
      if (!field.valid) {
        return res.status(400).json({
          success: false,
          message: 'One or more optional fields contain invalid data.',
        })
      }
    }

    if (
      services !== undefined &&
      (!Array.isArray(services) ||
        services.length > 10 ||
        services.some(
          (service) =>
            typeof service !== 'string' ||
            !service.trim() ||
            service.trim().length > 80
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid services selection.',
      })
    }

    const enquiry = await Enquiry.create({
      authorName: cleanName,
      email: cleanEmail,
      phone: optionalFields.phone.value,
      bookTitle: optionalFields.bookTitle.value,
      genre: optionalFields.genre.value,
      manuscriptStatus: optionalFields.manuscriptStatus.value,
      services: services?.map((service) => service.trim()),
      message: cleanMessage,
    })

    // Email failures must not affect saved enquiries
    try {
      const emailResults = await sendEnquiryEmails(enquiry)

      emailResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `${index === 0 ? 'Admin' : 'Customer'} enquiry email failed:`,
            result.reason?.message
          )
        }
      })
    } catch (emailError) {
      console.error('Enquiry email error:', emailError.message)
    }

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully.',
      data: enquiry,
    })
  } catch (error) {
    console.error('Create enquiry error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to submit enquiry. Please try again.',
    })
  }
}

// Get enquiries for admin dashboard
export async function getEnquiries(req, res) {
  try {
    const { status, search } = req.query
    const filter = {}

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid enquiry status filter.',
        })
      }

      filter.status = status
    }

    if (search !== undefined) {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search query.',
        })
      }

      const trimmedSearch = search.trim()

      if (trimmedSearch) {
        const escapedSearch = trimmedSearch.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        )

        const searchRegex = new RegExp(escapedSearch, 'i')

        filter.$or = [
          { authorName: searchRegex },
          { email: searchRegex },
          { bookTitle: searchRegex },
        ]
      }
    }

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    })
  } catch (error) {
    console.error('Get enquiries error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch enquiries.',
    })
  }
}

// Update enquiry status
export async function updateEnquiryStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body || {}

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
      })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry status.',
      })
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: { status } },
      { returnDocument: 'after', runValidators: true }
    )

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully.',
      data: enquiry,
    })
  } catch (error) {
    console.error('Update enquiry status error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update enquiry status.',
    })
  }
}

// Delete enquiry
export async function deleteEnquiry(req, res) {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
      })
    }

    const enquiry = await Enquiry.findByIdAndDelete(id)

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully.',
      data: { _id: enquiry._id },
    })
  } catch (error) {
    console.error('Delete enquiry error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete enquiry.',
    })
  }
}

// Dashboard summary
export async function getDashboardSummary(req, res) {
  try {
    const [
      total,
      newCount,
      inProgress,
      contacted,
      closed,
      recentEnquiries,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.countDocuments({ status: 'in-progress' }),
      Enquiry.countDocuments({ status: 'contacted' }),
      Enquiry.countDocuments({ status: 'closed' }),
      Enquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          total,
          new: newCount,
          inProgress,
          contacted,
          closed,
        },
        recentEnquiries,
      },
    })
  } catch (error) {
    console.error('Dashboard summary error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard summary.',
    })
  }
}
