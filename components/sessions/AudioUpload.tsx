'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Music, CheckCircle, Plus } from 'lucide-react'
import { addSessionAudio, deleteSessionAudio } from '@/lib/actions'

const ACCEPTED = '.mp3,.m4a,.wav,.ogg'
const MAX_PART = 90 * 1024 * 1024
const CHUNK_SIZE = 6 * 1024 * 1024

type AudioPart = {
  id: string
  label: string
  url: string
  position: number
}

async function getSignature(publicId: string, folder: string) {
  const res = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, folder }),
  })
  if (!res.ok) throw new Error('Impossible de signer la requête')
  return res.json() as Promise<{ timestamp: number; signature: string; apiKey: string }>
}

async function uploadPart(
  part: Blob,
  filename: string,
  cloudName: string,
  publicId: string,
  folder: string,
): Promise<string> {
  const { timestamp, signature, apiKey } = await getSignature(publicId, folder)
  const totalChunks = Math.ceil(part.size / CHUNK_SIZE)
  const uniqueUploadId = `uid_${publicId.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`
  let secureUrl = ''

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, part.size)
    const chunk = part.slice(start, end)

    const formData = new FormData()
    formData.append('file', new File([chunk], filename))
    formData.append('public_id', publicId)
    formData.append('folder', folder)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('api_key', apiKey)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        headers: {
          'X-Unique-Upload-Id': uniqueUploadId,
          'Content-Range': `bytes ${start}-${end - 1}/${part.size}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Erreur upload (${response.status})`)
    }

    const data = await response.json()
    if (data.secure_url) secureUrl = data.secure_url
  }

  if (!secureUrl) throw new Error('URL non reçue de Cloudinary')
  return secureUrl
}

export default function AudioUpload({
  sessionId,
  existingParts,
}: {
  sessionId: string
  existingParts: AudioPart[]
}) {
  const [parts, setParts] = useState<AudioPart[]>(existingParts)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const nextPosition = parts.length + 1

  const handleUpload = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) { setError('Cloudinary non configuré'); return }

    setUploading(true)
    setProgress(0)
    setError('')
    setDone(false)

    try {
      const folder = 'impact-disciple/audios'
      const numFileParts = Math.ceil(file.size / MAX_PART)
      const uploadedUrls: { url: string; label: string }[] = []

      for (let i = 0; i < numFileParts; i++) {
        const start = i * MAX_PART
        const end = Math.min(start + MAX_PART, file.size)
        const blob = file.slice(start, end)
        const posLabel = numFileParts > 1
          ? `Partie ${nextPosition + i}`
          : `Partie ${nextPosition}`
        const publicId = `session-${sessionId}-p${nextPosition + i}-${Date.now()}`

        setStatus(numFileParts > 1 ? `Envoi ${i + 1}/${numFileParts}...` : 'Upload en cours...')

        const url = await uploadPart(blob, file.name, cloudName, publicId, folder)
        uploadedUrls.push({ url, label: posLabel })
        setProgress(Math.round(((i + 1) / numFileParts) * 95))
      }

      // Sauvegarder chaque partie en BDD
      const newParts: AudioPart[] = []
      for (let i = 0; i < uploadedUrls.length; i++) {
        const pos = nextPosition + i
        await addSessionAudio(sessionId, uploadedUrls[i].url, uploadedUrls[i].label, pos)
        newParts.push({ id: `tmp-${pos}`, label: uploadedUrls[i].label, url: uploadedUrls[i].url, position: pos })
      }

      setParts([...parts, ...newParts])
      setProgress(100)
      setDone(true)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (part: AudioPart) => {
    if (!confirm(`Supprimer "${part.label}" ?`)) return
    try {
      await deleteSessionAudio(part.id, sessionId)
      setParts(parts.filter((p) => p.id !== part.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <Music size={16} className="text-primary" />
        Enregistrements audio
      </h3>

      {/* Liste des parties existantes */}
      {parts.length > 0 && (
        <div className="space-y-2">
          {parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between bg-card-hover rounded-xl px-3 py-2">
              <span className="text-sm font-medium">{part.label}</span>
              <button
                onClick={() => handleDelete(part)}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) { handleUpload(f); e.target.value = '' }
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
                <CheckCircle size={12} /> Upload terminé !
              </span>
            ) : (
              `${status} ${progress}%`
            )}
          </p>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-card-hover border border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Plus size={16} />
          Ajouter une partie ({parts.length > 0 ? `Partie ${nextPosition}` : 'Partie 1'})
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
