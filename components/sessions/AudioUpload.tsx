'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Music, CheckCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { addSessionAudio, deleteSessionAudio } from '@/lib/actions'

const ACCEPTED = '.mp3,.m4a,.wav,.ogg'
const MAX_PART = 90 * 1024 * 1024
const CHUNK_SIZE = 6 * 1024 * 1024

type AudioEntry = {
  id: string
  title: string | null
  description: string | null
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

async function uploadBlob(
  blob: Blob,
  filename: string,
  cloudName: string,
  publicId: string,
  folder: string,
): Promise<string> {
  const { timestamp, signature, apiKey } = await getSignature(publicId, folder)
  const totalChunks = Math.ceil(blob.size / CHUNK_SIZE)
  const uid = `uid_${publicId.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`
  let secureUrl = ''

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, blob.size)
    const chunk = blob.slice(start, end)
    const fd = new FormData()
    fd.append('file', new File([chunk], filename))
    fd.append('public_id', publicId)
    fd.append('folder', folder)
    fd.append('timestamp', String(timestamp))
    fd.append('signature', signature)
    fd.append('api_key', apiKey)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      headers: { 'X-Unique-Upload-Id': uid, 'Content-Range': `bytes ${start}-${end - 1}/${blob.size}` },
      body: fd,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Erreur upload (${res.status})`)
    }
    const data = await res.json()
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
  existingParts: AudioEntry[]
}) {
  const [entries, setEntries] = useState<AudioEntry[]>(existingParts)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) { setError('Cloudinary non configuré'); return }
    if (!title.trim()) { setError('Ajoutez un titre avant d\'uploader'); return }

    setUploading(true)
    setProgress(0)
    setError('')
    setDone(false)

    try {
      const folder = 'impact-disciple/audios'
      const numParts = Math.ceil(file.size / MAX_PART)
      const nextPos = entries.length + 1

      for (let i = 0; i < numParts; i++) {
        const start = i * MAX_PART
        const end = Math.min(start + MAX_PART, file.size)
        const blob = file.slice(start, end)
        const publicId = `session-${sessionId}-${Date.now()}-${i}`
        const partTitle = numParts > 1 ? `${title} (partie ${i + 1})` : title

        setStatus(numParts > 1 ? `Envoi partie ${i + 1}/${numParts}...` : 'Upload en cours...')
        const url = await uploadBlob(blob, file.name, cloudName, publicId, folder)

        await addSessionAudio(sessionId, url, partTitle, nextPos + i, description)
        setEntries((prev) => [...prev, { id: publicId, title: partTitle, description, url, position: nextPos + i }])
        setProgress(Math.round(((i + 1) / numParts) * 95))
      }

      setProgress(100)
      setDone(true)
      setTitle('')
      setDescription('')
      setShowForm(false)
      setTimeout(() => { setDone(false); window.location.reload() }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (entry: AudioEntry) => {
    if (!confirm(`Supprimer "${entry.title || 'cet audio'}" ?`)) return
    await deleteSessionAudio(entry.id, sessionId)
    setEntries(entries.filter((e) => e.id !== entry.id))
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Music size={16} className="text-primary" />
          Gestion des audios
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
        >
          <Plus size={14} />
          Ajouter un audio
          {showForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Liste des audios existants */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {[...entries].sort((a, b) => a.position - b.position).map((e) => (
            <div key={e.id} className="flex items-start justify-between bg-card-hover rounded-xl px-3 py-2 gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{e.title || 'Sans titre'}</p>
                {e.description && <p className="text-xs text-muted truncate">{e.description}</p>}
              </div>
              <button onClick={() => handleDelete(e)} className="text-muted hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs text-muted mb-1">Titre *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Enseignement principal, Témoignage..."
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Description (optionnel)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description visible par les membres"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleUpload(f); e.target.value = '' } }}
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted text-center">
                {done
                  ? <span className="flex items-center justify-center gap-1 text-nouveau"><CheckCircle size={12} /> Terminé !</span>
                  : `${status} ${progress}%`
                }
              </p>
            </div>
          ) : (
            <button
              onClick={() => { if (!title.trim()) { setError('Ajoutez un titre d\'abord'); return }; inputRef.current?.click() }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-background px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
            >
              <Upload size={14} />
              Choisir le fichier audio
            </button>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
