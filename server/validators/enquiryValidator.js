import Joi from 'joi'
import { ENQUIRY_STATUSES } from '../constants/index.js'

const optionalShortString = (maxLength) =>
  Joi.string()
    .trim()
    .max(maxLength)
    .allow('', null)
    .empty(['', null])
    .messages({
      'string.base': 'One or more optional fields contain invalid data.',
      'string.max': 'One or more optional fields contain invalid data.',
    })

export const createEnquirySchema = Joi.object({
  authorName: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Name, email and message are required.',
    'string.empty': 'Name, email and message are required.',
    'string.max': 'Name cannot exceed 100 characters.',
    'any.required': 'Name, email and message are required.',
  }),
  email: Joi.string()
    .trim()
    .lowercase()
    .max(254)
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Name, email and message are required.',
      'string.empty': 'Name, email and message are required.',
      'string.email': 'Please provide a valid email address.',
      'string.max': 'Please provide a valid email address.',
      'any.required': 'Name, email and message are required.',
    }),
  phone: optionalShortString(30),
  bookTitle: optionalShortString(150),
  genre: optionalShortString(80),
  manuscriptStatus: optionalShortString(80),
  services: Joi.array()
    .items(Joi.string().trim().min(1).max(80))
    .max(10)
    .messages({
      'array.base': 'Invalid services selection.',
      'array.max': 'Invalid services selection.',
      'string.base': 'Invalid services selection.',
      'string.empty': 'Invalid services selection.',
      'string.max': 'Invalid services selection.',
    }),
  message: Joi.string().trim().min(1).max(5000).required().messages({
    'string.base': 'Name, email and message are required.',
    'string.empty': 'Name, email and message are required.',
    'string.max': 'Message cannot exceed 5000 characters.',
    'any.required': 'Name, email and message are required.',
  }),
})

export const enquiryQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...ENQUIRY_STATUSES)
    .allow('')
    .empty('')
    .messages({
      'string.base': 'Invalid enquiry status filter.',
      'any.only': 'Invalid enquiry status filter.',
    }),
  search: Joi.string().trim().max(100).allow('').messages({
    'string.base': 'Invalid search query.',
    'string.max': 'Invalid search query.',
  }),
})

export const updateEnquiryStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ENQUIRY_STATUSES)
    .required()
    .messages({
      'string.base': 'Invalid enquiry status.',
      'any.only': 'Invalid enquiry status.',
      'any.required': 'Invalid enquiry status.',
    }),
})
