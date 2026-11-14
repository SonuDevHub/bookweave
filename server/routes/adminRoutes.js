
import { Router } from 'express'
import {
  adminLogin,
  forgotAdminPassword,
  resetAdminPassword,
  getAdminProfile,
  updateAdminProfile,
} from '../controllers/adminController.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

// Authentication
router.post('/login', adminLogin)
router.post('/forgot-password', forgotAdminPassword)
router.post('/reset-password', resetAdminPassword)

// Admin Profile
router.get('/profile', adminAuth, getAdminProfile)
router.patch('/profile', adminAuth, updateAdminProfile)

// Verify Admin
router.get('/verify', adminAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin authenticated successfully',
    adminId: req.adminId,
  })
})

export default router
