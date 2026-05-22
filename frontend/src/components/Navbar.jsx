import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ session }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-surface w-full z-50 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 md:px-margin-desktop h-20 max-w-container mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-headline-md font-semibold text-primary">
            Krit
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            className="w-full bg-surface-container pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-inverse-primary text-body-md"
            placeholder="Search inspiration..."
          />
        </div>

        <div className="flex items-center gap-4">
          {session && (
            <>
              <Link
                to="/upload"
                className="bg-primary text-on-primary px-6 py-2 rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                Upload
              </Link>
              <button
                onClick={handleLogout}
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-10 w-10 rounded-full hover:bg-surface-container"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
