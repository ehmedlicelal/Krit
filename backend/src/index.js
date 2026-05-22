import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import screenshotsRouter from './routes/screenshots.js'
import feedbackRouter from './routes/feedback.js'
import aiCritiqueRouter from './routes/aiCritique.js'
import authRouter from './routes/auth.js'
import { supabaseAdmin } from './services/supabase.js'
import { analyzeScreenshot } from './services/openrouter.js'

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

// Protected cron endpoint — callable by cron-job.org or Render cron jobs
app.get('/api/cron', async (req, res) => {
  const secret = req.query.secret || req.headers['x-cron-secret']
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const results = { keepWarm: 'ok', critiquesGenerated: 0, errors: [] }

  // 1. Keep-warm (already succeeded since we're here)

  // 2. Auto-generate missing AI critiques for recent public screenshots
  try {
    const { data: screenshots, error } = await supabaseAdmin
      .from('screenshots')
      .select('id, image_url, owner_id')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && screenshots?.length) {
      for (const screenshot of screenshots) {
        const { data: existing } = await supabaseAdmin
          .from('ai_critiques')
          .select('id')
          .eq('screenshot_id', screenshot.id)
          .limit(1)

        if (existing?.length) continue

        try {
          const analysis = await analyzeScreenshot(screenshot.image_url)
          const highlightedRegions = (analysis.issues || [])
            .filter((i) => i.approximate_region)
            .map((i) => i.approximate_region)

          await supabaseAdmin
            .from('ai_critiques')
            .insert({
              screenshot_id: screenshot.id,
              owner_id: screenshot.owner_id,
              summary: analysis.overall_summary || '',
              issues: analysis.issues || [],
              highlighted_regions: highlightedRegions,
            })

          results.critiquesGenerated++
        } catch (err) {
          results.errors.push(`Screenshot ${screenshot.id}: ${err.message}`)
        }
      }
    }
  } catch (err) {
    results.errors.push(`Cron error: ${err.message}`)
  }

  res.json({ status: 'ok', results })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
