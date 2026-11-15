export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (err && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size must be under 5 MB.',
    })
  }

  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed.',
    })
  }

  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    })
  }

  if (err instanceof URIError || (err && err.status === 400)) {
    return res.status(400).json({
      success: false,
      message: 'Malformed request URL or parameters.',
    })
  }

  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS.',
    })
  }

  if (err && err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors)[0]?.message
    return res.status(400).json({
      success: false,
      message: firstMessage || 'Validation failed.',
    })
  }

  if (err && err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier.',
    })
  }

  console.error('Unhandled server error:', err)

  return res.status((err && err.status) || 500).json({
    success: false,
    message: 'Internal server error.',
  })
}
