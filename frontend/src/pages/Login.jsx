import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <main className="w-full max-w-[440px] bg-surface-container-lowest rounded-[24px] shadow-ambient border border-primary/10 p-8 md:p-12">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-surface-container flex items-center justify-center shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H12.5" stroke="#4682A9" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3H21V8" stroke="#4682A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3L14 10" stroke="#4682A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="7" width="4" height="4" rx="1" fill="#91C8E4"/>
            </svg>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-body-md text-on-surface-variant text-center flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Log in with Email
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                mail
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface text-on-surface border border-outline-variant rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary-fixed-dim focus:ring-2 focus:ring-primary-fixed-dim/20 transition-all text-body-md placeholder:text-outline-variant/60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-label-md text-on-surface-variant" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                key
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface text-on-surface border border-outline-variant rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:border-primary-fixed-dim focus:ring-2 focus:ring-primary-fixed-dim/20 transition-all text-body-md placeholder:text-outline-variant/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary rounded-lg py-3.5 mt-2 text-label-md font-semibold hover:bg-primary-container hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-body-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary-container hover:underline transition-colors ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
