import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/healthRoutes.js'
import enquiryRoutes from './routes/enquiryRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import authorRoutes from './routes/authorRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistCandidates = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, '../dist'),
]
const clientDistPath =
  clientDistCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ||
  clientDistCandidates[0]
const clientIndexPath = path.join(clientDistPath, 'index.html')

const app = express()
const PORT = process.env.PORT || 5000

// Required behind reverse proxies (Render, Railway, Nginx, Heroku, etc.)
app.set('trust proxy', 1)

// Parse configured frontend origins (supports comma-separated list)
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  ...configuredOrigins,
])

// Security headers (CSP allows Cloudinary & Unsplash images used by the app)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        fontSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', ...allowedOrigins],
      },
    },
  })
)

// CORS configuration (allows configured origins and same-origin requests)
app.use(
  cors((req, callback) => {
    const rawOrigin = req.headers.origin
    if (!rawOrigin) {
      return callback(null, { origin: true, credentials: true })
    }

    const normalizedOrigin = rawOrigin.replace(/\/+$/, '')
    const host = req.get('host')
    const sameOriginHttp = host ? `http://${host}` : ''
    const sameOriginHttps = host ? `https://${host}` : ''

    if (
      allowedOrigins.has(normalizedOrigin) ||
      normalizedOrigin === sameOriginHttp ||
      normalizedOrigin === sameOriginHttps
    ) {
      return callback(null, { origin: true, credentials: true })
    }

    return callback(new Error('Not allowed by CORS'))
  })
)

// Request body limits
app.use(express.json({ limit: '20kb' }))

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
})

app.use('/api', apiLimiter)

// Dedicated public enquiry submission limit
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiries submitted. Please try again after 15 minutes.',
  },
})

// Stricter admin authentication rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again later.',
  },
})

app.use('/api/admin/login', authLimiter)
app.use('/api/admin/forgot-password', authLimiter)
app.use('/api/admin/reset-password', authLimiter)

// API routes
app.use('/api/health', healthRoutes)

// Apply dedicated limiter only to public POST enquiries
app.use(
  '/api/enquiries',
  (req, res, next) => {
    if (req.method === 'POST') {
      return enquiryLimiter(req, res, next)
    }

    return next()
  },
  enquiryRoutes
)

app.use('/api/admin', adminRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/authors', authorRoutes)

// Return JSON 404 for unknown API endpoints
app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

// Serve built frontend in production / after client build
if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath))

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(clientIndexPath)
    }

    return next()
  })
} else {
  app.get('/', (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'BookWeave API is running',
    })
  })
}

// Global JSON error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size must be under 5 MB.',
    })
  }

  if (err?.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed.',
    })
  }

  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    })
  }

  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS.',
    })
  }

  console.error('Unhandled server error:', err)

  return res.status(err?.status || 500).json({
    success: false,
    message: 'Internal server error.',
  })
})

// Start server
async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET is not set. Admin authentication will fail.')
    }

    await connectDB()

    app.listen(PORT, () => {
      console.log(`BookWeave server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
