import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true,
  })

  if (error) return res.status(400).json({ message: error.message })
  res.status(201).json({ user: data.user })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return res.status(401).json({ message: error.message })
  res.json({ session: data.session, user: data.user })
})

export default router
