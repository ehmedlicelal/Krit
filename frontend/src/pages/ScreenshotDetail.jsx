import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function ScreenshotDetail({ session }) {
  const { id } = useParams()
  const imgRef = useRef(null)
  const [screenshot, setScreenshot] = useState(null)
  const [feedbackList, setFeedbackList] = useState([])
  const [aiCritique, setAiCritique] = useState(null)
  const [activeTab, setActiveTab] = useState('community')
  const [hideFeedback, setHideFeedback] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionRect, setSelectionRect] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [hoveredFeedback, setHoveredFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = session?.access_token
  const isOwner = screenshot?.owner_id === session?.user?.id

  useEffect(() => {
    loadScreenshot()
  }, [id])

  const loadScreenshot = async () => {
    try {
      const data = await api.getScreenshot(id, token)
      setScreenshot(data)
      const fb = await api.getFeedback(id, token)
      setFeedbackList(fb)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAiCritique = async () => {
    if (!isOwner) return
    setAiLoading(true)
    try {
      const data = await api.getAiCritique(id, token)
      setAiCritique(data)
    } catch {
      setAiCritique(null)
    } finally {
      setAiLoading(false)
    }
  }

  const generateAiCritique = async () => {
    setAiLoading(true)
    try {
      const data = await api.generateAiCritique(id, token)
      setAiCritique(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'ai' && isOwner && !aiCritique) {
      loadAiCritique()
    }
  }, [activeTab, isOwner])

  const getNormalizedCoords = useCallback((e) => {
    if (!imgRef.current) return null
    const rect = imgRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  const handleMouseDown = (e) => {
    if (!isSelecting) return
    const coords = getNormalizedCoords(e)
    if (coords) {
      setSelectionStart(coords)
      setSelectionRect(null)
      setShowCommentInput(false)
    }
  }

  const handleMouseMove = (e) => {
    if (!isSelecting || !selectionStart) return
    const coords = getNormalizedCoords(e)
    if (coords) {
      setSelectionRect({
        x: Math.min(selectionStart.x, coords.x),
        y: Math.min(selectionStart.y, coords.y),
        width: Math.abs(coords.x - selectionStart.x),
        height: Math.abs(coords.y - selectionStart.y),
      })
    }
  }

  const handleMouseUp = () => {
    if (!isSelecting || !selectionRect) return
    if (selectionRect.width > 0.01 && selectionRect.height > 0.01) {
      setShowCommentInput(true)
      setIsSelecting(false)
    }
  }

  const submitFeedback = async () => {
    if (!commentText.trim() || !selectionRect) return
    try {
      const data = await api.addFeedback(
        {
          screenshot_id: id,
          comment: commentText,
          ...selectionRect,
        },
        token
      )
      setFeedbackList((prev) => [...prev, data])
      setCommentText('')
      setSelectionRect(null)
      setShowCommentInput(false)
      setSelectionStart(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const cancelFeedback = () => {
    setCommentText('')
    setSelectionRect(null)
    setShowCommentInput(false)
    setSelectionStart(null)
    setIsSelecting(false)
  }

  const severityColor = (severity) => {
    if (severity === 'high') return 'bg-error-container text-on-error-container'
    if (severity === 'medium') return 'bg-surface-variant text-on-surface-variant'
    return 'bg-primary-fixed text-primary'
  }

  const severityDot = (severity) => {
    if (severity === 'high') return 'bg-error'
    if (severity === 'medium') return 'bg-tertiary-container'
    return 'bg-primary-fixed-dim'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="animate-pulse text-primary text-headline-md">Loading...</div>
      </div>
    )
  }

  if (error && !screenshot) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
          <p className="text-headline-md text-on-surface mb-2">Error</p>
          <p className="text-body-md text-on-surface-variant mb-4">{error}</p>
          <Link to="/" className="text-primary font-semibold hover:underline">Back to Feed</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low text-on-surface h-screen flex flex-col overflow-hidden">
      <Navbar session={session} />

      <main className="flex-1 flex overflow-hidden max-w-container w-full mx-auto">
        {/* Left: Screenshot Viewer */}
        <div className="w-8/12 flex flex-col p-6 h-full">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 flex-none">
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              className={`text-label-md font-semibold px-5 py-2.5 rounded flex items-center gap-2 transition-colors shadow-sm ${
                isSelecting
                  ? 'bg-error text-on-error'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSelecting ? 'close' : 'add_comment'}
              </span>
              {isSelecting ? 'Cancel Selection' : 'Add Feedback'}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-on-surface-variant">Hide All Feedback</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={hideFeedback}
                  onChange={() => setHideFeedback(!hideFeedback)}
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Viewer Canvas */}
          <div
            className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-center relative overflow-hidden"
            style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={screenshot?.image_url}
              alt={screenshot?.title}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />

            {/* Feedback Markers */}
            {!hideFeedback &&
              feedbackList.map((fb, i) => (
                <div
                  key={fb.id}
                  className={`absolute border-2 border-dashed border-primary-fixed-dim rounded cursor-pointer flex items-start justify-end p-1 transition-all ${
                    hoveredFeedback === fb.id ? 'bg-primary-fixed/40 shadow-lg z-10' : 'bg-primary-fixed/20'
                  }`}
                  style={{
                    left: `${fb.x * 100}%`,
                    top: `${fb.y * 100}%`,
                    width: `${fb.width * 100}%`,
                    height: `${fb.height * 100}%`,
                  }}
                  onMouseEnter={() => setHoveredFeedback(fb.id)}
                  onMouseLeave={() => setHoveredFeedback(null)}
                >
                  <div className="w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px] font-semibold shadow-sm">
                    {i + 1}
                  </div>
                </div>
              ))}

            {/* Active Selection */}
            {selectionRect && (
              <div
                className="absolute border-2 border-primary bg-primary/10 rounded"
                style={{
                  left: `${selectionRect.x * 100}%`,
                  top: `${selectionRect.y * 100}%`,
                  width: `${selectionRect.width * 100}%`,
                  height: `${selectionRect.height * 100}%`,
                }}
              />
            )}

            {/* Comment Input Popup */}
            {showCommentInput && selectionRect && (
              <div
                className="absolute bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant p-4 z-20 w-72"
                style={{
                  left: `${Math.min(selectionRect.x * 100 + selectionRect.width * 100, 70)}%`,
                  top: `${selectionRect.y * 100}%`,
                }}
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add your feedback..."
                  rows={3}
                  autoFocus
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={cancelFeedback} className="text-body-sm text-on-surface-variant hover:text-on-surface">
                    Cancel
                  </button>
                  <button
                    onClick={submitFeedback}
                    className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-body-sm font-semibold hover:bg-primary-container transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <aside className="w-4/12 bg-surface flex flex-col h-full border-l border-outline-variant/30 shadow-[-10px_0_30px_rgba(70,130,169,0.03)]">
          {/* Tabs */}
          <div className="pt-8 px-6 pb-4 border-b border-outline-variant/20 flex-none">
            <div className="flex p-1 bg-surface-container-high rounded-full w-full">
              <button
                onClick={() => setActiveTab('community')}
                className={`flex-1 rounded-full px-4 py-2 text-label-md font-semibold text-center transition-all ${
                  activeTab === 'community'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Community Feedback
              </button>
              {isOwner && (
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 rounded-full px-4 py-2 text-label-md font-semibold text-center transition-all ${
                    activeTab === 'ai'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  AI Critique
                </button>
              )}
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {activeTab === 'community' && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[16px] font-semibold text-on-surface">Active Threads</h3>
                  <span className="text-label-md text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                    {feedbackList.length} Open
                  </span>
                </div>

                {feedbackList.length === 0 && (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-outline-variant text-[48px] mb-2">chat_bubble_outline</span>
                    <p className="text-body-md text-on-surface-variant">No feedback yet. Be the first to comment!</p>
                  </div>
                )}

                {feedbackList.map((fb, i) => (
                  <div
                    key={fb.id}
                    className={`bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-sm hover:border-primary-fixed-dim/50 transition-colors cursor-pointer ${
                      hoveredFeedback === fb.id ? 'border-primary-fixed-dim ring-1 ring-primary-fixed-dim/30' : ''
                    }`}
                    onMouseEnter={() => setHoveredFeedback(fb.id)}
                    onMouseLeave={() => setHoveredFeedback(null)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary text-label-md font-semibold flex-none">
                        {(fb.user_name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-label-md text-on-surface">{fb.user_name || 'Anonymous'}</span>
                          <span className="text-[12px] text-on-surface-variant">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="inline-block mt-1 text-[10px] text-primary bg-primary-fixed/30 px-2 py-0.5 rounded font-semibold">
                          Marker {i + 1}
                        </span>
                      </div>
                    </div>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'ai' && isOwner && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">psychology</span>
                  <h4 className="text-label-md text-on-surface font-semibold">Instant UI Critique</h4>
                </div>

                {aiLoading && (
                  <div className="text-center py-10">
                    <div className="animate-pulse text-primary text-headline-md mb-2">Analyzing...</div>
                    <p className="text-body-sm text-on-surface-variant">AI is reviewing your screenshot</p>
                  </div>
                )}

                {!aiLoading && !aiCritique && (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-outline-variant text-[48px] mb-4">auto_awesome</span>
                    <p className="text-body-md text-on-surface-variant mb-4">No AI analysis yet.</p>
                    <button
                      onClick={generateAiCritique}
                      className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors"
                    >
                      Generate AI Critique
                    </button>
                  </div>
                )}

                {!aiLoading && aiCritique && (
                  <div className="flex flex-col gap-4">
                    {/* Summary */}
                    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30">
                      <h5 className="text-label-md text-on-surface font-semibold mb-2">Overall Summary</h5>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">{aiCritique.summary}</p>
                    </div>

                    {/* Issues */}
                    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
                      <h5 className="text-label-md text-on-surface font-semibold mb-1">Detected Issues</h5>
                      {(aiCritique.issues || []).map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className={`flex-none mt-1.5 w-2 h-2 rounded-full ${severityDot(issue.severity)}`}></span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[11px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${severityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className="text-label-md text-on-surface">{issue.title}</span>
                            </div>
                            <p className="text-[13px] text-on-surface-variant">{issue.description}</p>
                            {issue.recommendation && (
                              <p className="text-[13px] text-primary mt-1">→ {issue.recommendation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
