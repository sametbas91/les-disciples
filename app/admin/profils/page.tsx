import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Shield, User } from 'lucide-react'
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
        <Shield size={28} className="text-primary" />
        Profils des membres
      </h1>

      {!profiles || profiles.length === 0 ? (
        <p className="text-muted text-sm">Aucun profil enregistre.</p>
      ) : (
        <div className="grid gap-4">
          {profiles.map((p) => (
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
              <div>
                <p className="font-medium">
                  {p.first_name || ''} {p.last_name || ''}
                  {!p.first_name && !p.last_name && <span className="text-muted">Sans nom</span>}
                </p>
                <p className="text-sm text-muted">
                  {[p.city, p.country].filter(Boolean).join(', ') || 'Aucune localisation'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
