import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/screenshots - public feed
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('screenshots')
    .select(`
      id, title, description, image_url, visibility, created_at,
      owner_id,
      profiles!screenshots_owner_id_fkey(full_name),
      feedback(count)
    `)
    .eq('visibility', 'public')
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

// GET /api/screenshots/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('screenshots')
    .select(`
      id, title, description, image_url, visibility, created_at, owner_id,
      profiles!screenshots_owner_id_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ message: 'Screenshot not found' })

  if (data.visibility === 'private' && data.owner_id !== req.user?.id) {
    return res.status(403).json({ message: 'Access denied' })
  }

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

export default router
