import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <main className="w-full max-w-[480px] bg-surface-container-lowest card-radius p-8 md:p-12 shadow-sm border border-primary/10 text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4">check_circle</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Check your email</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to Login
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <main className="w-full max-w-[480px] bg-surface-container-lowest card-radius p-8 md:p-12 shadow-sm border border-primary/10 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              target
            </span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">Create an Account</h1>
          <p className="text-body-md text-on-surface-variant">
            Join the collaborative workspace designed for deep focus.
          </p>
        </header>

        {/* Error */}
        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-label-md text-on-surface-variant" htmlFor="fullName">Full Name</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none">person</span>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-body-md text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors placeholder:text-outline-variant/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label-md text-on-surface-variant" htmlFor="emailAddr">Email Address</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none">mail</span>
              <input
                id="emailAddr"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-body-md text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors placeholder:text-outline-variant/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label-md text-on-surface-variant" htmlFor="passWord">Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none">lock</span>
              <input
                id="passWord"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full bg-surface-bright border border-outline-variant rounded-lg py-3 pl-12 pr-4 text-body-md text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors placeholder:text-outline-variant/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary text-label-md font-semibold py-4 rounded-lg mt-2 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
            {!loading && (
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-2 border-t border-surface-variant pt-6">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-label-md text-primary hover:text-primary-container transition-colors ml-1">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
