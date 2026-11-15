import rateLimit from 'express-rate-limit'

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

function createLimiter(limit, message) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  })
}

export const apiLimiter = createLimiter(
  200,
  'Too many requests. Please try again later.'
)

export const enquiryLimiter = createLimiter(
  5,
  'Too many enquiries submitted. Please try again after 15 minutes.'
)

export const authLimiter = createLimiter(
  10,
  'Too many authentication attempts. Try again later.'
)
