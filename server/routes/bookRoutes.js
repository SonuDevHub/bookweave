import { Router } from 'express'
import {
  createBook,
  deleteBook,
  getAdminBooks,
  getPublishedBooks,
  toggleBookPublish,
  updateBook,
} from '../controllers/bookController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { singleImageUpload } from '../middleware/uploadImage.js'
import { validate } from '../middleware/validate.js'
import { bookBodySchema } from '../validators/bookValidator.js'
import { objectIdParamSchema } from '../validators/commonValidator.js'

const router = Router()
const bookIdParams = validate(objectIdParamSchema('book'), 'params')

router.get('/', getPublishedBooks)
router.get('/admin', adminAuth, getAdminBooks)
router.post(
  '/',
  adminAuth,
  ...singleImageUpload('coverImage'),
  validate(bookBodySchema),
  createBook
)
router.patch(
  '/:id',
  adminAuth,
  bookIdParams,
  ...singleImageUpload('coverImage'),
  validate(bookBodySchema),
  updateBook
)
router.patch('/:id/publish', adminAuth, bookIdParams, toggleBookPublish)
router.delete('/:id', adminAuth, bookIdParams, deleteBook)

export default router
