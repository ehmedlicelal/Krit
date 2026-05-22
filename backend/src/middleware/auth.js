import { supabaseAdmin } from '../services/supabase.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    req.user = user
    req.token = token
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    req.user = user || null
    req.token = token
  } catch {
    req.user = null
  }
  next()
}
