'use client'

import { deleteSession } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async () => {
    await deleteSession(sessionId)
    router.push('/sessions')
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Confirmer
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="bg-card-hover text-foreground px-3 py-2 rounded-lg text-sm hover:bg-border transition-colors"
        >
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 bg-red-600/10 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-600/20 transition-colors"
    >
      <Trash2 size={14} />
      Supprimer
    </button>
  )
}
