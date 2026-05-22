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
      id, comment, x, y, width, height, created_at, user_id, parent_id,
      profiles!feedback_user_id_profiles_fkey(full_name)
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
  const { screenshot_id, comment, x, y, width, height, parent_id } = req.body

  if (!screenshot_id || !comment) {
    return res.status(400).json({ message: 'screenshot_id and comment are required' })
  }

  // For top-level feedback, coordinates are required. For replies, they're optional.
  if (!parent_id && (x == null || y == null || width == null || height == null)) {
    return res.status(400).json({ message: 'Coordinates (x, y, width, height) are required for top-level feedback' })
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
      x: x ?? 0,
      y: y ?? 0,
      width: width ?? 0,
      height: height ?? 0,
      parent_id: parent_id || null,
    })
    .select(`
      id, comment, x, y, width, height, created_at, user_id, parent_id,
      profiles!feedback_user_id_profiles_fkey(full_name)
    `)
    .single()

  if (error) return res.status(500).json({ message: error.message })

  res.status(201).json({
    ...data,
    user_name: data.profiles?.full_name || 'Anonymous',
  })
})

// DELETE /api/feedback/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  const { data: fb, error: fetchErr } = await supabaseAdmin
    .from('feedback')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (fetchErr || !fb) {
    return res.status(404).json({ message: 'Feedback not found' })
  }

  if (fb.user_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own feedback' })
  }

  const { error } = await supabaseAdmin
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ message: error.message })
  res.json({ message: 'Feedback deleted' })
})
export default router
