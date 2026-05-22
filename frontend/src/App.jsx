import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Upload from './pages/Upload'
import ScreenshotDetail from './pages/ScreenshotDetail'

function RequireAuth({ session, children }) {
  const location = useLocation()
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="animate-pulse text-primary text-headline-md">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Feed session={session} /> : <Navigate to="/login" />} />
        <Route path="/upload" element={session ? <Upload session={session} /> : <Navigate to="/login" />} />
        <Route path="/screenshot/:id" element={
          <RequireAuth session={session}>
            <ScreenshotDetail session={session} />
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
