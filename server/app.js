import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { STATIC_ASSET_EXT_RE } from './constants/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distCandidates = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../client/dist'),
]
const clientDistPath =
  distCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ||
  distCandidates[0]
const clientAssetsPath = path.join(clientDistPath, 'assets')
const clientIndexPath = path.join(clientDistPath, 'index.html')

function buildAllowedOrigins(port) {
  const configured = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  return new Set([
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    ...configured,
  ])
}

export function createApp() {
  const app = express()
  const port = Number(process.env.PORT) || 5000
  const isProduction = process.env.NODE_ENV === 'production'
  const allowedOrigins = buildAllowedOrigins(port)

  app.set('trust proxy', 1)
  app.disable('x-powered-by')

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

  app.use(express.json({ limit: '20kb' }))
  app.use((req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      req.body = {}
    }
    next()
  })

  const apiCors = cors((req, callback) => {
    const rawOrigin = req.headers.origin
    if (!rawOrigin) {
      return callback(null, { origin: true, credentials: true })
    }

    const normalizedOrigin = rawOrigin.replace(/\/+$/, '')
    const forwardedHostHeader = req.get('x-forwarded-host')
    const forwardedHost = forwardedHostHeader
      ? forwardedHostHeader.split(',')[0].trim()
      : ''
    const hosts = [req.get('host'), forwardedHost].filter(Boolean)
    const isSameHost = hosts.some(
      (host) =>
        normalizedOrigin === `http://${host}` ||
        normalizedOrigin === `https://${host}`
    )

    if (allowedOrigins.has(normalizedOrigin) || isSameHost) {
      return callback(null, { origin: true, credentials: true })
    }

    return callback(new Error('Not allowed by CORS'))
  })

  app.use('/api', apiCors, apiRoutes)

  if (fs.existsSync(clientIndexPath)) {
    app.get('/index.html', (req, res) => res.redirect(301, '/'))

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

    app.use(
      express.static(clientDistPath, {
        index: false,
        maxAge: '1d',
      })
    )

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
          message:
            'Frontend build not found. Run "npm run build" before starting the server.',
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

  app.use((req, res) => {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
    })
  })

  app.use(errorHandler)

  return app
}

const app = createApp()
export default app
