
import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Administrator',
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    resetTokenHash: {
      type: String,
      default: null,
    },
    resetOtpHash: {
      type: String,
      default: null,
    },
    resetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const Admin = mongoose.model('Admin', adminSchema)

export default Admin
