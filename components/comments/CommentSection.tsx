'use client'

import { addComment, deleteComment } from '@/lib/actions'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import type { Comment } from '@/lib/supabase'

export default function CommentSection({
  sessionId,
  comments,
  isAdmin,
}: {
  sessionId: string
  comments: Comment[]
  isAdmin: boolean
}) {
  const { user } = useUser()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await addComment(sessionId, content.trim())
      setContent('')
    } catch {
      alert('Erreur lors de l\'ajout du commentaire')
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (confirm('Supprimer ce commentaire ?')) {
      await deleteComment(commentId, sessionId)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Commentaires ({comments.length})</h3>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-card-hover rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-primary">{c.author_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">
                  {new Date(c.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {(isAdmin || user?.id === c.author_id) && (
                  <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Aucun commentaire</p>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-primary text-background px-3 py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-muted text-sm text-center">Connectez-vous pour commenter</p>
      )}
    </div>
  )
}
