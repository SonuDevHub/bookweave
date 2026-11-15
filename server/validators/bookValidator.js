import Joi from 'joi'

const requiredText = Joi.string().trim().min(1).required().messages({
  'string.base': 'All book fields are required.',
  'string.empty': 'All book fields are required.',
  'any.required': 'All book fields are required.',
})

export const bookBodySchema = Joi.object({
  title: requiredText,
  author: requiredText,
  genre: requiredText,
  description: requiredText,
})
