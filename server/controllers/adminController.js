
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import Admin from '../models/Admin.js'

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    })

    

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
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
      admin: {
        id: admin._id,
        name: admin.name || 'Administrator',
        email: admin.email,
        role: 'Admin',
        createdAt: admin.createdAt,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    })
  }
}

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select(
      'name email createdAt'
    )

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name || 'Administrator',
        email: admin.email,
        role: 'Admin',
        createdAt: admin.createdAt,
      },
    })
  } catch (error) {
    console.error('Get admin profile error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch profile',
    })
  }
}

export const updateAdminProfile = async (req, res) => {
  try {
    const { name } = req.body

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      })
    }

    if (name.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 60 characters',
      })
    }

    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      { $set: { name: name.trim() } },
      { returnDocument: 'after', runValidators: true }
    ).select('name email createdAt')

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'Admin',
        createdAt: admin.createdAt,
      },
    })
  } catch (error) {
    console.error('Update admin profile error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to update profile',
    })
  }
}

export const forgotAdminPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const admin = await Admin.findOne({ email })

    const genericResponse = {
      success: true,
      message: 'If the admin account exists, an OTP will be sent.',
    }

    if (!admin) return res.status(200).json(genericResponse)

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured',
      })
    }

    const otp = crypto.randomInt(100000, 1000000).toString()

    admin.resetOtpHash = crypto.createHash('sha256').update(otp).digest('hex')
    admin.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    admin.resetOtpAttempts = 0

    await admin.save()

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: admin.email,
        subject: 'BookWeave Password Reset OTP',
        text: `Your BookWeave admin password reset OTP is ${otp}.\n\nIt expires in 10 minutes. Do not share this code with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#24352e">
            <h2>BookWeave Password Reset</h2>
            <p>Use this code to reset your admin password:</p>
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${otp}</p>
            <p>This OTP expires in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `,
      })
    } catch (emailError) {
      admin.resetOtpHash = null
      admin.resetOtpExpiresAt = null
      admin.resetOtpAttempts = 0
      await admin.save()

      console.error('OTP email error:', emailError.message)
      return res.status(503).json({
        success: false,
        message: 'Unable to send OTP. Please try again later.',
      })
    }

    return res.status(200).json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to process password reset request',
    })
  }
}

export const resetAdminPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const { otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required',
      })
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 6-digit OTP',
      })
    }

    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8–128 characters long',
      })
    }

    const admin = await Admin.findOne({ email })

    if (!admin || !admin.resetOtpHash || !admin.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or expired. Request a new OTP.',
      })
    }

    if (admin.resetOtpExpiresAt <= new Date()) {
      admin.resetOtpHash = null
      admin.resetOtpExpiresAt = null
      admin.resetOtpAttempts = 0
      await admin.save()

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Request a new OTP.',
      })
    }

    if ((admin.resetOtpAttempts || 0) >= 5) {
      admin.resetOtpHash = null
      admin.resetOtpExpiresAt = null
      admin.resetOtpAttempts = 0
      await admin.save()

      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Request a new OTP.',
      })
    }

    const submittedHash = crypto.createHash('sha256').update(String(otp)).digest('hex')

    const validOtp = crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'hex'),
      Buffer.from(admin.resetOtpHash, 'hex')
    )

    if (!validOtp) {
      admin.resetOtpAttempts = (admin.resetOtpAttempts || 0) + 1
      await admin.save()

      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP',
      })
    }

    admin.passwordHash = await bcrypt.hash(password, 12)
    admin.resetOtpHash = null
    admin.resetOtpExpiresAt = null
    admin.resetOtpAttempts = 0

    await admin.save()

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in.',
    })
  } catch (error) {
    console.error('Reset password error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Unable to reset password',
    })
  }
}
