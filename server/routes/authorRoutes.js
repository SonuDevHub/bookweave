import { Router } from 'express'
import {
  createAuthor,
  deleteAuthor,
  getAdminAuthors,
  getAuthors,
  updateAuthor,
} from '../controllers/authorController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { singleImageUpload } from '../middleware/uploadImage.js'
import { validate } from '../middleware/validate.js'
import {
  createAuthorSchema,
  updateAuthorSchema,
} from '../validators/authorValidator.js'
import { objectIdParamSchema } from '../validators/commonValidator.js'

const router = Router()
const authorIdParams = validate(objectIdParamSchema('author'), 'params')

router.get('/', getAuthors)
router.get('/admin', adminAuth, getAdminAuthors)
router.post(
  '/',
  adminAuth,
  ...singleImageUpload('profileImage'),
  validate(createAuthorSchema),
  createAuthor
)
router.patch(
  '/:id',
  adminAuth,
  authorIdParams,
  ...singleImageUpload('profileImage'),
  validate(updateAuthorSchema),
  updateAuthor
)
router.delete('/:id', adminAuth, authorIdParams, deleteAuthor)

export default router
