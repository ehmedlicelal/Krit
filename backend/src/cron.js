import 'dotenv/config'
import { supabaseAdmin } from './services/supabase.js'
import { analyzeScreenshot } from './services/openrouter.js'

const API_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`

async function keepWarm() {
  try {
    const res = await fetch(`${API_URL}/api/health`)
    const data = await res.json()
    console.log(`[${new Date().toISOString()}] Keep-warm ping: ${data.status}`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Keep-warm failed:`, err.message)
  }
}

async function generateMissingCritiques() {
  const { data: screenshots, error } = await supabaseAdmin
    .from('screenshots')
    .select('id, image_url, owner_id')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !screenshots?.length) {
    console.log(`[${new Date().toISOString()}] No screenshots to process`)
    return
  }

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

      console.log(`[${new Date().toISOString()}] Generated AI critique for screenshot ${screenshot.id}`)
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Failed critique for ${screenshot.id}:`, err.message)
    }
  }
}

async function run() {
  console.log(`[${new Date().toISOString()}] Cron job started`)
  await keepWarm()
  await generateMissingCritiques()
  console.log(`[${new Date().toISOString()}] Cron job finished`)
  process.exit(0)
}

run()
