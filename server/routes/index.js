import { Router } from 'express'
import { apiLimiter } from '../middleware/rateLimiters.js'
import healthRoutes from './healthRoutes.js'
import enquiryRoutes from './enquiryRoutes.js'
import adminRoutes from './adminRoutes.js'
import bookRoutes from './bookRoutes.js'
import authorRoutes from './authorRoutes.js'

const router = Router()

// Mount health check before rate limiter so uptime probes are never throttled
router.use('/health', healthRoutes)

router.use(apiLimiter)

router.use('/enquiries', enquiryRoutes)
router.use('/admin', adminRoutes)
router.use('/books', bookRoutes)
router.use('/authors', authorRoutes)

router.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

export default router
