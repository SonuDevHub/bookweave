import Enquiry from '../models/Enquiry.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { escapeRegex } from '../utils/validators.js'
import { sendEnquiryEmails } from '../utils/emailService.js'

export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body)

  // Email failures must not affect saved enquiries
  try {
    const emailResults = await sendEnquiryEmails(enquiry)
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const label = index === 0 ? 'Admin' : 'Customer'
        console.error(`${label} enquiry email failed:`, result.reason.message)
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
})

export const getEnquiries = asyncHandler(async (req, res) => {
  const { status, search } = req.validatedQuery
  const filter = {}

  if (status) {
    filter.status = status
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), 'i')
    filter.$or = [
      { authorName: searchRegex },
      { email: searchRegex },
      { bookTitle: searchRegex },
    ]
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
})

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { returnDocument: 'after', runValidators: true }
  )

  if (!enquiry) {
    throw new AppError(404, 'Enquiry not found.')
  }

  return res.status(200).json({
    success: true,
    message: 'Enquiry status updated successfully.',
    data: enquiry,
  })
})

export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id)
  if (!enquiry) {
    throw new AppError(404, 'Enquiry not found.')
  }

  return res.status(200).json({
    success: true,
    message: 'Enquiry deleted successfully.',
    data: { _id: enquiry._id },
  })
})

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [groupedCounts, recentEnquiries] = await Promise.all([
    Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const countByStatus = Object.fromEntries(
    groupedCounts.map((item) => [item._id, item.count])
  )

  const newCount = countByStatus.new || 0
  const inProgress = countByStatus['in-progress'] || 0
  const contacted = countByStatus.contacted || 0
  const closed = countByStatus.closed || 0

  return res.status(200).json({
    success: true,
    data: {
      counts: {
        total: newCount + inProgress + contacted + closed,
        new: newCount,
        inProgress,
        contacted,
        closed,
      },
      recentEnquiries,
    },
  })
})
