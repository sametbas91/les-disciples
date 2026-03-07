'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Music, CheckCircle } from 'lucide-react'
import * as tus from 'tus-js-client'
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
    if (file.size > 200 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 200 MB)')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setDone(false)

    const ext = file.name.split('.').pop() || 'mp3'
    const filePath = `sessions/${sessionId}/audio.${ext}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const upload = new tus.Upload(file, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: {
        authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        'x-upsert': 'true',
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: 'audios',
        objectName: filePath,
        contentType: file.type,
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024, // 6MB chunks
      onError: (err) => {
        setError(err.message || 'Erreur upload')
        setUploading(false)
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 95))
      },
      onSuccess: async () => {
        try {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/audios/${filePath}`
          await saveAudioUrl(sessionId, publicUrl)
          setProgress(100)
          setDone(true)
          setTimeout(() => window.location.reload(), 1000)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur sauvegarde URL')
        } finally {
          setUploading(false)
        }
      },
    })

    // Check for previous uploads to resume
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }
      upload.start()
    })
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
