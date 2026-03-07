import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import Image from 'next/image'
import { User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminProfileDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') redirect('/')

  const { userId } = await params
  const db = getServiceSupabase()
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted">Profil introuvable.</p>
        <Link href="/admin/profils" className="text-primary text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const age = profile.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/profils" className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Retour aux profils
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={80} height={80} className="rounded-full border-2 border-primary" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-card-hover flex items-center justify-center">
              <User size={32} className="text-muted" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{profile.first_name} {profile.last_name}</h1>
            {age !== null && <p className="text-sm text-muted">{age} ans</p>}
          </div>
        </div>

        {profile.bio && (
          <div>
            <p className="text-sm text-muted mb-1">Bio</p>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted">Adresse</p>
            <p>{profile.address || '-'}</p>
          </div>
          <div>
            <p className="text-muted">Ville</p>
            <p>{profile.city || '-'}</p>
          </div>
          <div>
            <p className="text-muted">Pays</p>
            <p>{profile.country || '-'}</p>
          </div>
          <div>
            <p className="text-muted">Date de naissance</p>
            <p>{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('fr-FR') : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
