import { Router } from 'express'
import {
  adminLogin,
  forgotAdminPassword,
  getAdminProfile,
  resetAdminPassword,
  updateAdminProfile,
} from '../controllers/adminController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import {
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/adminValidator.js'

const router = Router()

router.post('/login', authLimiter, validate(adminLoginSchema), adminLogin)
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  forgotAdminPassword
)
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  resetAdminPassword
)

router.get('/profile', adminAuth, getAdminProfile)
router.patch(
  '/profile',
  adminAuth,
  validate(updateProfileSchema),
  updateAdminProfile
)

router.get('/verify', adminAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin authenticated successfully',
    adminId: req.adminId,
  })
})

export default router
