import { Router } from 'express'

const router = Router()

// Check API status
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BookWeave API is running',
  })
})

export default router