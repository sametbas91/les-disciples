import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Shield, User, FolderOpen, Clock } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AdminProfilsPage() {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') redirect('/')

  const db = getServiceSupabase()
  const { data: profiles } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const requests = profiles?.filter((p) => p.drive_access_requested && !p.drive_access) || []
  const others = profiles?.filter((p) => !p.drive_access_requested || p.drive_access) || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
        <Shield size={28} className="text-primary" />
        Profils des membres
      </h1>

      {/* Demandes d'accès Drive en attente */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-wider">
            <Clock size={14} />
            Demandes d&apos;accès Drive ({requests.length})
          </h2>
          <div className="grid gap-3">
            {requests.map((p) => (
              <Link
                key={p.id}
                href={`/admin/profils/${p.user_id}`}
                className="bg-card border border-primary/40 rounded-2xl p-4 flex items-center gap-4 hover:border-primary transition-colors"
              >
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt="" width={48} height={48} className="rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-card-hover flex items-center justify-center">
                    <User size={20} className="text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {p.first_name || ''} {p.last_name || ''}
                    {!p.first_name && !p.last_name && <span className="text-muted">Sans nom</span>}
                  </p>
                  <p className="text-sm text-muted">
                    {[p.city, p.country].filter(Boolean).join(', ') || 'Aucune localisation'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  <FolderOpen size={12} />
                  Demande Drive
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tous les profils */}
      <div className="space-y-3">
        {requests.length > 0 && (
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Tous les membres</h2>
        )}
        {!profiles || profiles.length === 0 ? (
          <p className="text-muted text-sm">Aucun profil enregistré.</p>
        ) : (
          <div className="grid gap-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/admin/profils/${p.user_id}`}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt="" width={48} height={48} className="rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-card-hover flex items-center justify-center">
                    <User size={20} className="text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {p.first_name || ''} {p.last_name || ''}
                    {!p.first_name && !p.last_name && <span className="text-muted">Sans nom</span>}
                  </p>
                  <p className="text-sm text-muted">
                    {[p.city, p.country].filter(Boolean).join(', ') || 'Aucune localisation'}
                  </p>
                </div>
                {p.drive_access && (
                  <span className="flex items-center gap-1 text-xs text-nouveau bg-nouveau/10 px-2 py-1 rounded-lg">
                    <FolderOpen size={12} />
                    Drive autorisé
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
