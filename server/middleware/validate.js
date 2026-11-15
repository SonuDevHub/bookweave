import { AppError } from '../utils/AppError.js'

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: true,
      stripUnknown: true,
    })

    if (error) {
      return next(new AppError(400, error.details[0].message))
    }

    // Express 5 defines req.query as a read-only getter, so store parsed query separately
    if (source === 'query') {
      req.validatedQuery = value
    } else {
      req[source] = value
    }

    return next()
  }
}
