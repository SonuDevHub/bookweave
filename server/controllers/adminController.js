import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Admin from '../models/Admin.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import {
  isEmailConfigured,
  sendPasswordResetOtpEmail,
} from '../utils/emailService.js'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5

function formatAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name || 'Administrator',
    email: admin.email,
    role: 'Admin',
    createdAt: admin.createdAt,
  }
}

function clearOtpFields(admin) {
  admin.resetOtpHash = null
  admin.resetOtpExpiresAt = null
  admin.resetOtpAttempts = 0
}

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const admin = await Admin.findOne({ email })
  const validPassword =
    admin && (await bcrypt.compare(password, admin.passwordHash))

  if (!validPassword) {
    throw new AppError(401, 'Invalid email or password')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  const token = jwt.sign(
    { adminId: admin._id.toString(), role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    admin: formatAdmin(admin),
  })
})

export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.adminId).select('name email createdAt')
  if (!admin) {
    throw new AppError(404, 'Admin account not found')
  }

  return res.status(200).json({
    success: true,
    data: formatAdmin(admin),
  })
})

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name } = req.body

  const admin = await Admin.findByIdAndUpdate(
    req.adminId,
    { $set: { name } },
    { returnDocument: 'after', runValidators: true }
  ).select('name email createdAt')

  if (!admin) {
    throw new AppError(404, 'Admin account not found')
  }

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: formatAdmin(admin),
  })
})

export const forgotAdminPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const genericResponse = {
    success: true,
    message: 'If the admin account exists, an OTP will be sent.',
  }

  const admin = await Admin.findOne({ email })
  if (!admin) {
    return res.status(200).json(genericResponse)
  }

  if (!isEmailConfigured()) {
    throw new AppError(503, 'Email service is not configured')
  }

  const otp = crypto.randomInt(100000, 1000000).toString()

  admin.resetOtpHash = crypto.createHash('sha256').update(otp).digest('hex')
  admin.resetOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS)
  admin.resetOtpAttempts = 0
  await admin.save()

  try {
    await sendPasswordResetOtpEmail(admin.email, otp)
  } catch (emailError) {
    clearOtpFields(admin)
    await admin.save()

    console.error('OTP email error:', emailError.message)
    throw new AppError(503, 'Unable to send OTP. Please try again later.')
  }

  return res.status(200).json(genericResponse)
})

export const resetAdminPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body

  const admin = await Admin.findOne({ email })
  if (!admin || !admin.resetOtpHash || !admin.resetOtpExpiresAt) {
    throw new AppError(400, 'OTP is invalid or expired. Request a new OTP.')
  }

  if (admin.resetOtpExpiresAt <= new Date()) {
    clearOtpFields(admin)
    await admin.save()
    throw new AppError(400, 'OTP expired. Request a new OTP.')
  }

  if (admin.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
    clearOtpFields(admin)
    await admin.save()
    throw new AppError(429, 'Too many attempts. Request a new OTP.')
  }

  const submittedHash = crypto.createHash('sha256').update(otp).digest('hex')
  const validOtp = crypto.timingSafeEqual(
    Buffer.from(submittedHash, 'hex'),
    Buffer.from(admin.resetOtpHash, 'hex')
  )

  if (!validOtp) {
    admin.resetOtpAttempts += 1
    await admin.save()
    throw new AppError(400, 'Incorrect OTP')
  }

  admin.passwordHash = await bcrypt.hash(password, 12)
  clearOtpFields(admin)
  await admin.save()

  return res.status(200).json({
    success: true,
    message: 'Password reset successful. Please log in.',
  })
})
