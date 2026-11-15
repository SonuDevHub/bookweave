import Joi from 'joi'

const nameField = Joi.string().trim().min(1).max(100).required().messages({
  'string.base': 'Please enter a valid author name.',
  'string.empty': 'Please enter a valid author name.',
  'string.max': 'Author name cannot exceed 100 characters.',
  'any.required': 'Please enter a valid author name.',
})

const designationField = Joi.string().trim().max(100).allow('').messages({
  'string.base': 'Invalid designation.',
  'string.max': 'Designation cannot exceed 100 characters.',
})

export const createAuthorSchema = Joi.object({
  name: nameField,
  bio: Joi.string().trim().min(1).max(2000).required().messages({
    'string.base': 'Valid author name and bio are required.',
    'string.empty': 'Valid author name and bio are required.',
    'string.max': 'Bio cannot exceed 2000 characters.',
    'any.required': 'Valid author name and bio are required.',
  }),
  designation: designationField.default(''),
})

export const updateAuthorSchema = Joi.object({
  name: nameField,
  bio: Joi.string().trim().max(2000).allow('').messages({
    'string.base': 'Invalid author bio.',
    'string.max': 'Bio cannot exceed 2000 characters.',
  }),
  designation: designationField,
})
