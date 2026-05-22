const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(endpoint, options = {}) {
  const { method = 'GET', body, token } = options
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }
  return res.json()
}

export const api = {
  getPublicFeed: (token) => request('/api/screenshots', { token }),
  getMyScreenshots: (token) => request('/api/screenshots/mine', { token }),
  getScreenshot: (id, token) => request(`/api/screenshots/${id}`, { token }),
  uploadScreenshot: (data, token) =>
    request('/api/screenshots', { method: 'POST', body: data, token }),
  getFeedback: (screenshotId, token) =>
    request(`/api/feedback/${screenshotId}`, { token }),
  addFeedback: (data, token) =>
    request('/api/feedback', { method: 'POST', body: data, token }),
  addReply: (data, token) =>
    request('/api/feedback', { method: 'POST', body: data, token }),
  deleteFeedback: (id, token) =>
    request(`/api/feedback/${id}`, { method: 'DELETE', token }),
  getAiCritique: (screenshotId, token) =>
    request(`/api/ai-critique/${screenshotId}`, { token }),
  generateAiCritique: (screenshotId, token) =>
    request(`/api/ai-critique/${screenshotId}`, { method: 'POST', token }),
}
