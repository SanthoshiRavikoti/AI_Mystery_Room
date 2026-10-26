import express from 'express'
import cors from 'cors'
import { caseRoutes } from './routes/caseRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean)

app.disable('x-powered-by')
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
  return callback(new Error('Origin not allowed by CORS'))
} }))
app.use(express.json({ limit: '12kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/cases', caseRoutes)
app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'That route was not found.' } }))
app.use(errorHandler)

export default app
