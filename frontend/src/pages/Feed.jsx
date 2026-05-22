import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function Feed({ session }) {
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('recent')

  const token = session?.access_token

  useEffect(() => {
    loadScreenshots()
  }, [filter])

  const loadScreenshots = async () => {
    setLoading(true)
    try {
      let data
      if (filter === 'mine' && token) {
        data = await api.getMyScreenshots(token)
      } else {
        data = await api.getPublicFeed(token)
      }
      if (filter === 'trending') {
        data = [...data].sort((a, b) => (b.feedback_count || 0) - (a.feedback_count || 0))
      }
      setScreenshots(data)
    } catch (err) {
      console.error('Failed to load feed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-low min-h-screen">
      <Navbar session={session} />

      <main className="pt-8 pb-12 px-6 md:px-margin-desktop max-w-container mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-headline-lg text-on-surface">Community Feed</h1>
            <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Explore the latest UI/UX designs shared by the community. Engage with critiques and discover new patterns.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${
                filter === 'recent'
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${
                filter === 'trending'
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Trending
            </button>
            {session && (
              <button
                onClick={() => setFilter('mine')}
                className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${
                  filter === 'mine'
                    ? 'bg-primary text-on-primary'
                    : 'bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                My Uploads
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-primary text-headline-md">Loading screenshots...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && screenshots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-outline-variant text-[64px] mb-4">image</span>
            <h2 className="text-headline-md text-on-surface mb-2">No screenshots yet</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Be the first to share a design for review.</p>
            <Link
              to="/upload"
              className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors"
            >
              Upload Screenshot
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && screenshots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {screenshots.map((s) => (
              <Link
                key={s.id}
                to={`/screenshot/${s.id}`}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-surface-container-highest"
              >
                <div className="h-60 bg-surface-container w-full relative overflow-hidden group-hover:opacity-90 transition-opacity">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.image_url})` }}
                  />
                  {s.visibility === 'private' && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-surface/90 backdrop-blur-sm text-on-surface-variant px-2.5 py-1 rounded-full text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      Link only
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-headline-md text-on-surface group-hover:text-tertiary transition-colors">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-inverse-on-surface px-2 py-1 rounded-md">
                      <span className="material-symbols-outlined text-sm text-secondary">forum</span>
                      <span className="text-label-md text-secondary">{s.feedback_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary text-label-md font-semibold">
                      {(s.owner_name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-label-md text-on-surface-variant">{s.owner_name || 'Anonymous'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
