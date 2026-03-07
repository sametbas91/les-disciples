'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Music, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const ACCEPTED = '.mp3,.m4a,.wav,.ogg'

export default function AudioUpload({
  sessionId,
  currentUrl,
}: {
  sessionId: string
  currentUrl: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const getClient = () =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

  const handleUpload = async (file: File) => {
    if (file.size > 200 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 200 MB)')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setDone(false)

    try {
      const ext = file.name.split('.').pop() || 'mp3'
      const filePath = `sessions/${sessionId}/audio.${ext}`

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90))
      }, 200)

      const res = await fetch(`/api/audio/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fileName: filePath,
          contentType: file.type,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur upload')
      }

      // Upload directly to storage
      const supabase = getClient()
      const { error: uploadError } = await supabase.storage
        .from('audios')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        })

      clearInterval(progressInterval)

      if (uploadError) throw new Error(uploadError.message)

      // Get public URL and save to session
      const { data: publicUrl } = supabase.storage.from('audios').getPublicUrl(filePath)

      const saveRes = await fetch(`/api/audio/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          audioUrl: publicUrl.publicUrl,
        }),
      })

      if (!saveRes.ok) throw new Error('Erreur sauvegarde URL')

      setProgress(100)
      setDone(true)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cet enregistrement audio ?')) return
    setError('')

    try {
      const res = await fetch(`/api/audio/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) throw new Error('Erreur suppression')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Music size={16} className="text-primary" />
          Enregistrement audio
        </h3>
        {currentUrl && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
            Supprimer
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleUpload(f)
        }}
      />

      {uploading ? (
        <div className="space-y-2">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted text-center">
            {done ? (
              <span className="flex items-center justify-center gap-1 text-nouveau">
                <CheckCircle size={12} /> Upload termine !
              </span>
            ) : (
              `Upload en cours... ${progress}%`
            )}
          </p>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-card-hover border border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Upload size={16} />
          {currentUrl ? 'Remplacer l\'audio' : 'Ajouter un enregistrement'}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
