import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/feedback/:screenshotId
router.get('/:screenshotId', optionalAuth, async (req, res) => {
  const { screenshotId } = req.params

  // Verify screenshot is accessible
  const { data: screenshot, error: sErr } = await supabaseAdmin
    .from('screenshots')
    .select('id, visibility, owner_id')
    .eq('id', screenshotId)
    .single()

  if (sErr || !screenshot) {
    return res.status(404).json({ message: 'Screenshot not found' })
  }

  if (screenshot.visibility === 'private' && screenshot.owner_id !== req.user?.id) {
    return res.status(403).json({ message: 'Access denied' })
  }

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .select(`
      id, comment, x, y, width, height, created_at, user_id,
      profiles!feedback_user_id_fkey(full_name)
    `)
    .eq('screenshot_id', screenshotId)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ message: error.message })

  const formatted = data.map((fb) => ({
    ...fb,
    user_name: fb.profiles?.full_name || 'Anonymous',
  }))

  res.json(formatted)
})

// POST /api/feedback
router.post('/', requireAuth, async (req, res) => {
  const { screenshot_id, comment, x, y, width, height } = req.body

  if (!screenshot_id || !comment || x == null || y == null || width == null || height == null) {
    return res.status(400).json({ message: 'All fields are required: screenshot_id, comment, x, y, width, height' })
  }

  // Verify screenshot is accessible
  const { data: screenshot } = await supabaseAdmin
    .from('screenshots')
    .select('id, visibility, owner_id')
    .eq('id', screenshot_id)
    .single()

  if (!screenshot) {
    return res.status(404).json({ message: 'Screenshot not found' })
  }

  if (screenshot.visibility === 'private' && screenshot.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' })
  }

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert({
      screenshot_id,
      user_id: req.user.id,
      comment,
      x,
      y,
      width,
      height,
    })
    .select(`
      id, comment, x, y, width, height, created_at, user_id,
      profiles!feedback_user_id_fkey(full_name)
    `)
    .single()

  if (error) return res.status(500).json({ message: error.message })

  res.status(201).json({
    ...data,
    user_name: data.profiles?.full_name || 'Anonymous',
  })
})

export default router
