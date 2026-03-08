'use client'

import { useState } from 'react'
import { FolderOpen, Loader2 } from 'lucide-react'
import { toggleDriveAccess } from '@/lib/actions'

export default function DriveAccessToggle({
  userId,
  driveAccess,
  requested,
}: {
  userId: string
  driveAccess: boolean
  requested?: boolean
}) {
  const [enabled, setEnabled] = useState(driveAccess)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleDriveAccess(userId, !enabled)
      setEnabled(!enabled)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FolderOpen size={16} className="text-primary" />
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            Accès au Drive des enseignements
            {requested && !enabled && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-lg">Demande en attente</span>
            )}
          </p>
          <p className="text-xs text-muted">
            {enabled ? 'Accès autorisé — peut voir le lien Drive' : 'Accès refusé — voit un message en attente'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? 'bg-nouveau' : 'bg-border'
        }`}
      >
        {loading ? (
          <Loader2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
        ) : (
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        )}
      </button>
    </div>
  )
}
