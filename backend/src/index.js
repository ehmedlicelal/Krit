import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import screenshotsRouter from './routes/screenshots.js'
import feedbackRouter from './routes/feedback.js'
import aiCritiqueRouter from './routes/aiCritique.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/screenshots', screenshotsRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/ai-critique', aiCritiqueRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
