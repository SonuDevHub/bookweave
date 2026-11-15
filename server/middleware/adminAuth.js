import jwt from 'jsonwebtoken'

export function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    })
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing',
    })
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured')
    return res.status(500).json({
      success: false,
      message: 'Server authentication is not configured',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      decoded.role !== 'admin' ||
      !decoded.adminId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      })
    }

    req.adminId = decoded.adminId
    req.admin = decoded

    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      })
    }

    console.error('Admin authentication error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}
