'use client'

import { useState } from 'react'
import { FolderOpen, Clock, Loader2, CheckCircle } from 'lucide-react'
import { requestDriveAccess } from '@/lib/actions'

export default function DriveAccessRequest({ requested }: { requested: boolean }) {
  const [done, setDone] = useState(requested)
  const [loading, setLoading] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    try {
      await requestDriveAccess()
      setDone(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Clock size={14} className="text-primary" />
        <span>Demande envoyée — en attente de validation par un administrateur</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="flex items-center gap-2 bg-card-hover border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-primary/40 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FolderOpen size={14} className="text-primary" />
      )}
      Demander l&apos;accès aux enregistrements
    </button>
  )
}
