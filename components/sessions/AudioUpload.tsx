'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Music, CheckCircle } from 'lucide-react'
import { saveAudioUrl, deleteAudio } from '@/lib/actions'

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

  const handleUpload = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 100 MB). Compressez en MP3 avant.')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setDone(false)

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary non configure')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', `impact-disciple/audios`)
      formData.append('public_id', `session-${sessionId}`)
      formData.append('resource_type', 'video') // Cloudinary uses "video" for audio

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl, true)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 95))
          }
        }

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              await saveAudioUrl(sessionId, data.secure_url)
              setProgress(100)
              setDone(true)
              setTimeout(() => window.location.reload(), 1000)
              resolve()
            } catch (err) {
              reject(err instanceof Error ? err : new Error('Erreur sauvegarde URL'))
            }
          } else {
            let msg = `Upload echoue (${xhr.status})`
            try {
              const data = JSON.parse(xhr.responseText)
              if (data.error?.message) msg = data.error.message
            } catch { /* ignore parse error */ }
            reject(new Error(msg))
          }
        }

        xhr.onerror = () => reject(new Error('Erreur reseau'))

        xhr.send(formData)
      })
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
      await deleteAudio(sessionId)
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
