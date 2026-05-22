import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { analyzeScreenshot } from '../services/openrouter.js'

const router = Router()

// GET /api/ai-critique/:screenshotId - owner only
router.get('/:screenshotId', requireAuth, async (req, res) => {
  const { screenshotId } = req.params

  // Verify ownership
  const { data: screenshot } = await supabaseAdmin
    .from('screenshots')
    .select('id, owner_id, image_url')
    .eq('id', screenshotId)
    .single()

  if (!screenshot) {
    return res.status(404).json({ message: 'Screenshot not found' })
  }

  if (screenshot.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'AI critique is only available to the screenshot owner' })
  }

  const { data, error } = await supabaseAdmin
    .from('ai_critiques')
    .select('*')
    .eq('screenshot_id', screenshotId)
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return res.status(404).json({ message: 'No AI critique found. Generate one first.' })
  }

  res.json(data)
})

// POST /api/ai-critique/:screenshotId - generate new critique (owner only)
router.post('/:screenshotId', requireAuth, async (req, res) => {
  const { screenshotId } = req.params

  // Verify ownership
  const { data: screenshot } = await supabaseAdmin
    .from('screenshots')
    .select('id, owner_id, image_url')
    .eq('id', screenshotId)
    .single()

  if (!screenshot) {
    return res.status(404).json({ message: 'Screenshot not found' })
  }

  if (screenshot.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'AI critique is only available to the screenshot owner' })
  }

  try {
    const analysis = await analyzeScreenshot(screenshot.image_url)

    const highlightedRegions = (analysis.issues || [])
      .filter((i) => i.approximate_region)
      .map((i) => i.approximate_region)

    const { data, error } = await supabaseAdmin
      .from('ai_critiques')
      .insert({
        screenshot_id: screenshotId,
        owner_id: req.user.id,
        summary: analysis.overall_summary || '',
        issues: analysis.issues || [],
        highlighted_regions: highlightedRegions,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ message: error.message })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ message: `AI analysis failed: ${err.message}` })
  }
})

export default router
