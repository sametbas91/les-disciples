'use client'

import { useState, useRef } from 'react'
import { saveProfile } from '@/lib/actions'
import { Save, Loader2, Camera } from 'lucide-react'
import Image from 'next/image'

type Profile = {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  address: string | null
  city: string | null
  country: string | null
  bio: string | null
  avatar_url: string | null
} | null

type ClerkUser = {
  id: string
  firstName: string
  lastName: string
}

export default function ProfileForm({ profile, clerkUser }: { profile: Profile; clerkUser: ClerkUser }) {
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)
  const [convertedFile, setConvertedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function compressImage(file: File, maxSize: number, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            const name = file.name.replace(/\.[^.]+$/, '.jpg')
            resolve(new File([blob], name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (!file) return

    const originalSize = file.size
    setConverting(true)

    const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
      || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')

    if (isHeic) {
      try {
        const heic2any = (await import('heic2any')).default
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }) as Blob
        file = new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' })
      } catch {
        setMessage('Erreur lors de la conversion HEIC.')
        setConverting(false)
        return
      }
    }

    try {
      file = await compressImage(file, 800, 0.8)
      console.log(`Avatar: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(file.size / 1024 / 1024).toFixed(2)} MB`)
    } catch {
      setMessage('Erreur lors de la compression.')
      setConverting(false)
      return
    }

    setConverting(false)
    setConvertedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const formData = new FormData(e.currentTarget)
      // Replace avatar with converted file if applicable
      if (convertedFile) {
        formData.set('avatar', convertedFile)
      }
      await saveProfile(formData)
      setMessage('Profil sauvegarde avec succes !')
    } catch {
      setMessage('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <div
          className="relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden bg-card-hover cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {converting ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : avatarPreview ? (
            <Image src={avatarPreview} alt="Photo de profil" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Camera size={24} />
            </div>
          )}
          {!converting && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary hover:text-primary-light transition-colors"
          >
            Changer la photo
          </button>
          {converting && <p className="text-xs text-primary mt-1">Conversion en cours...</p>}
          {!converting && <p className="text-xs text-muted mt-1">JPG, PNG, HEIC. Max 2 Mo.</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1">Prenom</label>
          <input
            name="first_name"
            type="text"
            defaultValue={profile?.first_name || clerkUser.firstName}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Nom</label>
          <input
            name="last_name"
            type="text"
            defaultValue={profile?.last_name || clerkUser.lastName}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Date de naissance</label>
        <input
          name="birth_date"
          type="date"
          defaultValue={profile?.birth_date || ''}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Adresse (rue)</label>
        <input
          name="address"
          type="text"
          defaultValue={profile?.address || ''}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1">Ville</label>
          <input
            name="city"
            type="text"
            defaultValue={profile?.city || ''}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Pays</label>
          <input
            name="country"
            type="text"
            defaultValue={profile?.country || ''}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Bio</label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={profile?.bio || ''}
          placeholder="Parle-nous de toi..."
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {message && (
        <p className={`text-sm ${message.includes('succes') ? 'text-nouveau' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-background px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </form>
  )
}
