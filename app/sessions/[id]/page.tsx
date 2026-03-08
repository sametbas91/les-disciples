import { getServiceSupabase } from '@/lib/supabase'
import { formatDate, formatDuration } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import DeleteSessionButton from '@/components/sessions/DeleteSessionButton'
import CopyButton from '@/components/sessions/CopyButton'
import CommentSection from '@/components/comments/CommentSection'
import AudioPlayer from '@/components/sessions/AudioPlayer'
import AudioUpload from '@/components/sessions/AudioUpload'
import Link from 'next/link'
import { ArrowLeft, Edit, FolderOpen, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sessionClaims, userId } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === 'admin'
  const isLoggedIn = !!userId
  const db = getServiceSupabase()

  const { data: session } = await db.from('sessions').select('*').eq('id', id).single()
  if (!session) notFound()

  // Vérifier accès Drive
  let hasDriveAccess = false
  if (userId) {
    const { data: profile } = await db.from('profiles').select('drive_access').eq('user_id', userId).single()
    hasDriveAccess = profile?.drive_access === true
  }

  // Audios de la session (nouvelle table)
  const { data: audioParts } = await db
    .from('session_audios')
    .select('*')
    .eq('session_id', id)
    .order('position', { ascending: true })

  const { data: attendances } = await db
    .from('attendances')
    .select('*, member:members(*)')
    .eq('session_id', id)

  const { data: comments } = await db
    .from('comments')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  const { data: commentLikes } = await db
    .from('comment_likes')
    .select('*')
    .in('comment_id', (comments || []).map((c) => c.id))

  const enrichedComments = (comments || []).map((c) => {
    const likes = (commentLikes || []).filter((l) => l.comment_id === c.id)
    return {
      ...c,
      parent_id: c.parent_id || null,
      likes_count: likes.length,
      user_has_liked: userId ? likes.some((l) => l.user_id === userId) : false,
    }
  })

  const discipleAttendances = attendances?.filter((a) => a.member?.status === 'Disciple') || []
  const inviteAttendances = attendances?.filter((a) => a.member?.status !== 'Disciple') || []
  const newAttendances = attendances?.filter((a) => a.is_first_time) || []
  const hasAttendances = (attendances?.length || 0) > 0
  const displayDisciples = hasAttendances ? discipleAttendances.length : (session.disciples_count ?? 0)
  const displayInvites = hasAttendances ? inviteAttendances.length : (session.invites_count ?? 0)
  const displayTotal = hasAttendances ? (attendances?.length || 0) : (displayDisciples + displayInvites)

  const copyText = `Session du ${formatDate(session.date)} - "${session.theme}" (${formatDuration(session.duration)})

DISCIPLES (${discipleAttendances.length}) :
${discipleAttendances.map((a) => `- ${a.member?.name}`).join('\n')}

INVITES (${inviteAttendances.length}) :
${inviteAttendances.map((a) => `- ${a.member?.name}`).join('\n')}
${newAttendances.length > 0 ? `\nNOUVEAUX (${newAttendances.length}) :\n${newAttendances.map((a) => `- ${a.member?.name}`).join('\n')}` : ''}

Total presents : ${attendances?.length || 0}`

  return (
    <div className="space-y-6">
      <Link href="/sessions" className="flex items-center gap-2 text-muted hover:text-foreground text-sm transition-colors">
        <ArrowLeft size={16} />
        Retour aux sessions
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">{session.theme}</h1>
            <p className="text-muted mt-1">{formatDate(session.date)}</p>
            <p className="text-sm text-muted mt-1">{formatDuration(session.duration)}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && <CopyButton text={copyText} />}
            {isAdmin && (
              <>
                <Link
                  href={`/sessions/new?edit=${session.id}`}
                  className="flex items-center gap-1 bg-card-hover text-foreground px-3 py-2 rounded-lg text-sm hover:bg-border transition-colors"
                >
                  <Edit size={14} />
                  Modifier
                </Link>
                <DeleteSessionButton sessionId={session.id} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Participation summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-disciple">{displayDisciples}</p>
          <p className="text-sm text-muted">Disciples</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-invite">{displayInvites}</p>
          <p className="text-sm text-muted">Invit&eacute;s</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-nouveau">{newAttendances.length}</p>
          <p className="text-sm text-muted">Nouveaux</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{displayTotal}</p>
          <p className="text-sm text-muted">Total pr&eacute;sents</p>
        </div>
      </div>

      {/* Accès Drive */}
      {isLoggedIn && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <FolderOpen size={16} className="text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Enregistrements des enseignements</h3>
          </div>
          {hasDriveAccess || isAdmin ? (
            <a
              href="https://drive.google.com/drive/folders/13-iwK8_uWCL9yZc6FpQAhrdvQeaNlcJr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors w-fit"
            >
              <FolderOpen size={14} />
              Accéder au Drive
            </a>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Lock size={14} />
              <span>Accès en attente de validation par un administrateur</span>
            </div>
          )}
        </div>
      )}

      {/* Audio */}
      {(audioParts && audioParts.length > 0) && (
        <AudioPlayer parts={audioParts} isLoggedIn={isLoggedIn} />
      )}
      {isAdmin && (
        <AudioUpload sessionId={session.id} existingParts={audioParts || []} />
      )}

      {/* Comments */}
      <CommentSection
        sessionId={session.id}
        comments={enrichedComments}
        isAdmin={isAdmin}
      />
    </div>
  )
}
