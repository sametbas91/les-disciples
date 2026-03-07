'use client'

import { addComment, deleteComment, toggleCommentLike } from '@/lib/actions'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Send, Trash2, ThumbsUp, Reply, ChevronDown, ChevronUp } from 'lucide-react'

type Comment = {
  id: string
  session_id: string
  author_name: string
  author_id: string | null
  content: string
  parent_id: string | null
  created_at: string
  likes_count: number
  user_has_liked: boolean
}

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
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const topLevelComments = comments.filter((c) => !c.parent_id)
  const repliesMap = new Map<string, Comment[]>()
  comments.filter((c) => c.parent_id).forEach((c) => {
    const arr = repliesMap.get(c.parent_id!) || []
    arr.push(c)
    repliesMap.set(c.parent_id!, arr)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await addComment(sessionId, content.trim())
      setContent('')
    } catch {
      alert("Erreur lors de l'ajout du commentaire")
    }
    setLoading(false)
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    setReplyLoading(true)
    try {
      await addComment(sessionId, replyContent.trim(), parentId)
      setReplyContent('')
      setReplyTo(null)
      setExpandedReplies((prev) => new Set(prev).add(parentId))
    } catch {
      alert("Erreur lors de l'ajout de la reponse")
    }
    setReplyLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (confirm('Supprimer ce commentaire ?')) {
      await deleteComment(commentId, sessionId)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!user) return
    await toggleCommentLike(commentId, sessionId)
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  const renderComment = (c: Comment, isReply = false) => (
    <div key={c.id} className={`bg-card-hover rounded-lg p-3 ${isReply ? 'ml-8 border-l-2 border-primary/20' : ''}`}>
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

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => handleLike(c.id)}
          disabled={!user}
          className={`flex items-center gap-1 text-xs transition-colors ${
            c.user_has_liked ? 'text-primary' : 'text-muted hover:text-foreground'
          } disabled:opacity-50`}
        >
          <ThumbsUp size={12} />
          {c.likes_count > 0 && <span>{c.likes_count}</span>}
        </button>
        {!isReply && user && (
          <button
            onClick={() => {
              setReplyTo(replyTo === c.id ? null : c.id)
              setReplyContent('')
            }}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Reply size={12} />
            Repondre
          </button>
        )}
        {!isReply && (repliesMap.get(c.id)?.length || 0) > 0 && (
          <button
            onClick={() => toggleReplies(c.id)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            {expandedReplies.has(c.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {repliesMap.get(c.id)!.length} reponse{repliesMap.get(c.id)!.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Commentaires ({topLevelComments.length})</h3>

      <div className="space-y-3 mb-4">
        {topLevelComments.map((c) => (
          <div key={c.id}>
            {renderComment(c)}

            {/* Reply form */}
            {replyTo === c.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Ecrire une reponse..."
                  className="flex-1 bg-card-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply(c.id)
                    }
                  }}
                />
                <button
                  onClick={() => handleReply(c.id)}
                  disabled={replyLoading || !replyContent.trim()}
                  className="bg-primary text-background px-3 py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            )}

            {/* Replies */}
            {expandedReplies.has(c.id) && (
              <div className="space-y-2 mt-2">
                {(repliesMap.get(c.id) || []).map((r) => renderComment(r, true))}
              </div>
            )}
          </div>
        ))}
        {topLevelComments.length === 0 && (
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
