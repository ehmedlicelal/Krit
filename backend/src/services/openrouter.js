const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function analyzeScreenshot(imageUrl) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const prompt = `You are a professional UI/UX design reviewer. Analyze the provided screenshot and return a structured JSON critique.

Return ONLY valid JSON with this exact structure:
{
  "overall_summary": "Brief 2-3 sentence summary of the design quality",
  "issues": [
    {
      "title": "Short issue title",
      "description": "Detailed explanation of the problem",
      "severity": "high|medium|low",
      "recommendation": "Actionable suggestion to fix it",
      "approximate_region": { "x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0 }
    }
  ]
}

Focus on: visual hierarchy, CTA visibility, spacing/alignment, contrast/accessibility, text readability, clutter, and grouping. Use normalized coordinates (0-1) for regions.`

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://krit-app.vercel.app',
      'X-Title': 'Krit',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found in AI response')
  } catch (e) {
    return {
      overall_summary: content.slice(0, 500),
      issues: [],
    }
  }
}
