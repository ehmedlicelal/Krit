import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export function createSupabaseClient(accessToken) {
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })
}
