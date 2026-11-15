import './config/env.js'
import mongoose from 'mongoose'
import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = Number(process.env.PORT) || 5000
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
