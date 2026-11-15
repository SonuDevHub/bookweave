import { Router } from 'express'
import {
  createEnquiry,
  deleteEnquiry,
  getDashboardSummary,
  getEnquiries,
  updateEnquiryStatus,
} from '../controllers/enquiryController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { enquiryLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import { objectIdParamSchema } from '../validators/commonValidator.js'
import {
  createEnquirySchema,
  enquiryQuerySchema,
  updateEnquiryStatusSchema,
} from '../validators/enquiryValidator.js'

const router = Router()
const enquiryIdParams = validate(objectIdParamSchema('enquiry'), 'params')

router.post('/', enquiryLimiter, validate(createEnquirySchema), createEnquiry)

router.get('/dashboard-summary', adminAuth, getDashboardSummary)
router.get('/', adminAuth, validate(enquiryQuerySchema, 'query'), getEnquiries)
router.patch(
  '/:id/status',
  adminAuth,
  enquiryIdParams,
  validate(updateEnquiryStatusSchema),
  updateEnquiryStatus
)
router.delete('/:id', adminAuth, enquiryIdParams, deleteEnquiry)

export default router
