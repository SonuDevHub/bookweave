
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import Admin from '../models/Admin.js'

async function createAdmin() {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env')
    }

    if (ADMIN_PASSWORD.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    await connectDB()

    const email = ADMIN_EMAIL.trim().toLowerCase()
    const existingAdmin = await Admin.findOne({ email })

    if (existingAdmin) {
      existingAdmin.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
      existingAdmin.resetOtpHash = null
      existingAdmin.resetOtpExpiresAt = null
      existingAdmin.resetOtpAttempts = 0
      await existingAdmin.save()

      console.log('Admin password updated successfully.')
      return
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

    await Admin.create({ email, passwordHash })

    console.log('Admin created successfully.')
  } catch (error) {
    console.error('Admin setup failed:', error.message)
    process.exitCode = 1
  } finally {
    process.exit()
  }
}

createAdmin()
