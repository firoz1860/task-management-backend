import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { corsOptions } from './config/cors'
import { env } from './config/env'
import { errorMiddleware } from './middleware/error.middleware'
import authRoutes from './modules/auth/auth.routes'
import tasksRoutes from './modules/tasks/tasks.routes'

const app = express()
const prisma = new PrismaClient()

// Security
app.use(helmet())
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// Global error handler
app.use(errorMiddleware)

// Start server
const start = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`)
      console.log(`📊 Environment: ${env.NODE_ENV}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

start()

export default app
