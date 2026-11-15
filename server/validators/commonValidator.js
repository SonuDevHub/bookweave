import Joi from 'joi'

export function objectIdParamSchema(label = 'resource') {
  return Joi.object({
    id: Joi.string()
      .trim()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.base': `Invalid ${label} ID.`,
        'string.hex': `Invalid ${label} ID.`,
        'string.length': `Invalid ${label} ID.`,
        'string.empty': `Invalid ${label} ID.`,
        'any.required': `Invalid ${label} ID.`,
      }),
  })
}
