import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import routes from './routes/index.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// (Live par server ek proxy (Render) ke peeche hota hai, taaki rate limit ko asli visitor IP mile.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// (CLIENT_URL mein comma se kai domains de sakte hain, jaise apex + www. Aakhri "/" hata dete hain, warna browser ka Origin match nahi hota.
// Khaali ho toh CORS band: Netlify proxy (same-origin) setup mein iski zaroorat hi nahi.)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  }),
)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    success: true,
    message: 'Server is running',
    database: dbStates[mongoose.connection.readyState] || 'unknown',
  })
})

app.use('/api', routes)

// Hamesha sabse neeche rakhna
app.use(notFound)
app.use(errorHandler)

export default app