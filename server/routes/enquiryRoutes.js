
import { Router } from 'express'
import {
  createEnquiry,
  getEnquiries,
  getDashboardSummary,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../controllers/enquiryController.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

// Public website enquiry submission
router.post('/', createEnquiry)

// Admin-only routes
router.get('/', adminAuth, getEnquiries)
router.patch('/:id/status', adminAuth, updateEnquiryStatus)
router.delete('/:id', adminAuth, deleteEnquiry)
router.get('/dashboard-summary', adminAuth, getDashboardSummary)

export default router
