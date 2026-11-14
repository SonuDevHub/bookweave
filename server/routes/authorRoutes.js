import express from 'express'
import {
  getAuthors,
  getAdminAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController.js'
import { adminAuth } from '../middleware/adminAuth.js'
import uploadAuthorPhoto, {
  validateAuthorPhoto,
} from '../middleware/uploadAuthorPhoto.js'

const router = express.Router()

router.get('/', getAuthors)

router.get('/admin', adminAuth, getAdminAuthors)

router.post(
  '/',
  adminAuth,
  uploadAuthorPhoto.single('profileImage'),
  validateAuthorPhoto,
  createAuthor
)

router.patch(
  '/:id',
  adminAuth,
  uploadAuthorPhoto.single('profileImage'),
  validateAuthorPhoto,
  updateAuthor
)

router.delete('/:id', adminAuth, deleteAuthor)

export default router