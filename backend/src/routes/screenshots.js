import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/screenshots - public feed (+ owner's own private ones if logged in)
router.get('/', optionalAuth, async (req, res) => {
  let query = supabaseAdmin
    .from('screenshots')
    .select(`
      id, title, description, image_url, visibility, created_at,
      owner_id,
      profiles!screenshots_owner_id_profiles_fkey(full_name),
      feedback(count)
    `)
    .order('created_at', { ascending: false })

  // If logged in, show public + own private. Otherwise, public only.
  if (req.user) {
    query = query.or(`visibility.eq.public,owner_id.eq.${req.user.id}`)
  } else {
    query = query.eq('visibility', 'public')
  }

  const { data, error } = await query

  if (error) return res.status(500).json({ message: error.message })

  const formatted = data.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    image_url: s.image_url,
    visibility: s.visibility,
    created_at: s.created_at,
    owner_id: s.owner_id,
    owner_name: s.profiles?.full_name || 'Anonymous',
    feedback_count: s.feedback?.[0]?.count || 0,
  }))

  res.json(formatted)
})

// GET /api/screenshots/mine - only current user's screenshots
router.get('/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('screenshots')
    .select(`
      id, title, description, image_url, visibility, created_at,
      owner_id,
      profiles!screenshots_owner_id_profiles_fkey(full_name),
      feedback(count)
    `)
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ message: error.message })

  const formatted = data.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    image_url: s.image_url,
    visibility: s.visibility,
    created_at: s.created_at,
    owner_id: s.owner_id,
    owner_name: s.profiles?.full_name || 'Anonymous',
    feedback_count: s.feedback?.[0]?.count || 0,
  }))

  res.json(formatted)
})

// GET /api/screenshots/:id - anyone with the link can view
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('screenshots')
    .select(`
      id, title, description, image_url, visibility, created_at, owner_id,
      profiles!screenshots_owner_id_profiles_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ message: 'Screenshot not found' })

  res.json({
    ...data,
    owner_name: data.profiles?.full_name || 'Anonymous',
  })
})

// POST /api/screenshots
router.post('/', requireAuth, async (req, res) => {
  const { title, description, visibility, image_url } = req.body

  if (!title || !image_url) {
    return res.status(400).json({ message: 'Title and image_url are required' })
  }

  const { data, error } = await supabaseAdmin
    .from('screenshots')
    .insert({
      owner_id: req.user.id,
      title,
      description: description || null,
      image_url,
      visibility: visibility || 'public',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ message: error.message })
  res.status(201).json(data)
})

// DELETE /api/screenshots/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  const { data: screenshot, error: fetchErr } = await supabaseAdmin
    .from('screenshots')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (fetchErr || !screenshot) {
    return res.status(404).json({ message: 'Screenshot not found' })
  }

  if (screenshot.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own screenshots' })
  }

  // Delete related feedback first, then the screenshot
  await supabaseAdmin.from('feedback').delete().eq('screenshot_id', id)
  await supabaseAdmin.from('ai_critiques').delete().eq('screenshot_id', id)

  const { error } = await supabaseAdmin.from('screenshots').delete().eq('id', id)
  if (error) return res.status(500).json({ message: error.message })

  res.json({ message: 'Screenshot deleted' })
})

export default router
