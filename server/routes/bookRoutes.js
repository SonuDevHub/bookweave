
import express from 'express'
import {
  getPublishedBooks,
  getAdminBooks,
  createBook,
  updateBook,
  toggleBookPublish,
  deleteBook,
} from '../controllers/bookController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import uploadBookCover, {
  validateBookCover,
} from '../middleware/uploadBookCover.js'

const router = express.Router()

router.get('/', getPublishedBooks)

router.get('/admin', adminAuth, getAdminBooks)

router.post(
  '/',
  adminAuth,
  uploadBookCover.single('coverImage'),
  validateBookCover,
  createBook
)

router.patch(
  '/:id',
  adminAuth,
  uploadBookCover.single('coverImage'),
  validateBookCover,
  updateBook
)

router.patch('/:id/publish', adminAuth, toggleBookPublish)

router.delete('/:id', adminAuth, deleteBook)

export default router
