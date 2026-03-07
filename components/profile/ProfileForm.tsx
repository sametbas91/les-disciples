'use client'

import { useState } from 'react'
import { saveProfile } from '@/lib/actions'
import { Save, Loader2 } from 'lucide-react'
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
  imageUrl: string
}

export default function ProfileForm({ profile, clerkUser }: { profile: Profile; clerkUser: ClerkUser }) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const formData = new FormData(e.currentTarget)
      await saveProfile(formData)
      setMessage('Profil sauvegarde avec succes !')
    } catch {
      setMessage('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = profile?.avatar_url || clerkUser.imageUrl

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="Photo de profil"
            width={80}
            height={80}
            className="rounded-full border-2 border-primary"
          />
        )}
        <div>
          <p className="text-sm text-muted">Photo de profil Clerk</p>
          <p className="text-xs text-muted">Modifiable depuis les parametres Clerk</p>
        </div>
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
