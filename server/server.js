import './config/env.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/healthRoutes.js'
import enquiryRoutes from './routes/enquiryRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import authorRoutes from './routes/authorRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientDistCandidates = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../client/dist'),
]
const clientDistPath =
  clientDistCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ||
  clientDistCandidates[0]
const clientAssetsPath = path.join(clientDistPath, 'assets')
const clientIndexPath = path.join(clientDistPath, 'index.html')

const STATIC_ASSET_EXT_RE = /\.(?:js|mjs|cjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|otf|json|xml|txt|pdf|webmanifest|wasm|html?)$/i

const app = express()
const PORT = Number(process.env.PORT) || 5000
const isProduction = process.env.NODE_ENV === 'production'

// Required behind reverse proxies (Render, Railway, Nginx, Heroku, Cloudflare, etc.)
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Parse configured frontend origins (supports CLIENT_URL comma-separated list and FRONTEND_URL)
const configuredOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const allowedOrigins = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...configuredOrigins,
])

// Security headers (disable upgrade-insecure-requests unless FORCE_HTTPS=true so HTTP local prod works)
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
        upgradeInsecureRequests: process.env.FORCE_HTTPS === 'true' ? [] : null,
      },
    },
  })
)

// Request body limits
app.use(express.json({ limit: '20kb' }))

// Scope CORS strictly to /api so static assets and SPA routes are never blocked
const apiCors = cors((req, callback) => {
  const rawOrigin = req.headers.origin
  if (!rawOrigin) {
    return callback(null, { origin: true, credentials: true })
  }

  const normalizedOrigin = rawOrigin.replace(/\/+$/, '')
  const rawForwardedHost = req.get('x-forwarded-host')
  const forwardedHost = rawForwardedHost ? rawForwardedHost.split(',')[0].trim() : ''
  const host = req.get('host')
  const isSameHost = [host, forwardedHost]
    .filter(Boolean)
    .some((h) => normalizedOrigin === `http://${h}` || normalizedOrigin === `https://${h}`)

  if (allowedOrigins.has(normalizedOrigin) || isSameHost) {
    return callback(null, { origin: true, credentials: true })
  }

  return callback(new Error('Not allowed by CORS'))
})

app.use('/api', apiCors)

// Mount health check before rate limiters so platform uptime probes are never throttled
app.use('/api/health', healthRoutes)

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

// Serve built frontend in Single-Domain Monolith mode
if (fs.existsSync(clientIndexPath)) {
  // Redirect /index.html to canonical /
  app.get('/index.html', (req, res) => {
    return res.redirect(301, '/')
  })

  // Serve hashed Vite assets with immutable long-term cache; never fall back to index.html
  if (fs.existsSync(clientAssetsPath)) {
    app.use(
      '/assets',
      express.static(clientAssetsPath, {
        maxAge: '1y',
        immutable: true,
      })
    )
  }

  app.use('/assets', (req, res) => {
    return res
      .status(404)
      .set('Cache-Control', 'no-store')
      .type('text/plain')
      .send('Asset not found')
  })

  // Serve root static files (favicon.svg, icons.svg, etc.), keeping index.html uncached
  app.use(
    express.static(clientDistPath, {
      index: false,
      maxAge: '1d',
    })
  )

  // SPA history fallback for GET/HEAD HTML navigation requests
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next()
    }

    if (STATIC_ASSET_EXT_RE.test(req.path)) {
      return res
        .status(404)
        .set('Cache-Control', 'no-store')
        .type('text/plain')
        .send('Resource not found')
    }

    if (req.accepts(['html', 'json']) !== 'html') {
      return next()
    }

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    })

    return res.sendFile(clientIndexPath)
  })
} else if (isProduction) {
  console.warn(
    `Warning: Frontend build not found at ${clientIndexPath}. Run "npm run build" before starting in production.`
  )

  app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.status(503).json({
        success: false,
        message: 'Frontend build not found. Run "npm run build" before starting the server.',
      })
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

// Catch-all 404 for unhandled methods / non-HTML requests
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

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

  if (err instanceof URIError || err?.status === 400) {
    return res.status(400).json({
      success: false,
      message: 'Malformed request URL or parameters.',
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

// Start server with graceful shutdown
let httpServer = null

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET is not set. Admin authentication will fail.')
    }

    await connectDB()

    httpServer = app.listen(PORT, () => {
      console.log(`BookWeave server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`)

  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve))
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
    }

    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error.message)
    process.exit(1)
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export { app }

if (process.env.SKIP_SERVER_START !== 'true') {
  startServer()
}
