import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import taskRoutes from './routes/task.routes'
import attachmentRoutes from './routes/attachment.routes'
import activityRoutes from './routes/activity.routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(cookieParser())

// Log all incoming requests
app.use((req, res, next) => {
  console.log('[App] Incoming request:', req.method, req.path, req.url)
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/attachments', attachmentRoutes)
app.use('/api/activities', activityRoutes)

// Log unmatched routes
app.use((req, res, next) => {
  console.log('[App] Unmatched route:', req.method, req.path)
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  })
})

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
