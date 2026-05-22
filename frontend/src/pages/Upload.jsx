import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

export default function Upload({ session }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f) => {
    if (f && f.type.startsWith('image/')) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select an image')
    setError(null)
    setLoading(true)

    try {
      const fileName = `${session.user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName)

      const token = session.access_token
      const result = await api.uploadScreenshot(
        { title, description, visibility, image_url: publicUrl },
        token
      )

      navigate(`/screenshot/${result.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar session={session} />

      <main className="flex-1 w-full max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex justify-center">
        <div className="w-full max-w-3xl bg-surface-container-lowest/70 backdrop-blur-md rounded-[24px] shadow-ambient border border-primary/10 p-6 md:p-10 flex flex-col gap-8">
          <header>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">
              Upload Screenshot
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Add new design assets for AI analysis and collaborative review.
            </p>
          </header>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">
              {error}
            </div>
          )}

          {/* Drag & Drop */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-secondary-fixed/10'
                : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <div className="text-center px-4">
                  <p className="text-headline-md text-primary mb-1">Click to upload or drag and drop</p>
                  <p className="text-body-sm text-on-surface-variant">SVG, PNG, JPG or GIF (max. 10MB)</p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dashboard Redesign v2"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface" htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the context of this screenshot..."
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors shadow-sm resize-y"
              />
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Visibility</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="peer sr-only"
                  />
                  <div className="w-full p-4 border border-outline-variant rounded-xl bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-secondary-fixed/20 transition-all flex items-start gap-3 hover:bg-surface-container-low">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">public</span>
                    <div>
                      <p className="text-body-md font-semibold text-on-background">Public</p>
                      <p className="text-body-sm text-on-surface-variant mt-1">Anyone can view and comment.</p>
                    </div>
                  </div>
                </label>
                <label className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="peer sr-only"
                  />
                  <div className="w-full p-4 border border-outline-variant rounded-xl bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-secondary-fixed/20 transition-all flex items-start gap-3 hover:bg-surface-container-low">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">lock</span>
                    <div>
                      <p className="text-body-md font-semibold text-on-background">Private</p>
                      <p className="text-body-sm text-on-surface-variant mt-1">Only you and link holders can view.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-surface-variant flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg text-body-md font-semibold text-primary hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-lg text-body-md font-semibold text-on-primary bg-primary shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">upload</span>
                {loading ? 'Uploading...' : 'Upload Screenshot'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
