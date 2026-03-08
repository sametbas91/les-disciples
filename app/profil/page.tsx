import { currentUser } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import ProfileForm from '@/components/profile/ProfileForm'
import ThemeToggle from '@/components/layout/ThemeToggle'
import DriveAccessRequest from '@/components/profile/DriveAccessRequest'

export const dynamic = 'force-dynamic'

export default async function ProfilPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const db = getServiceSupabase()
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { sessionClaims } = await auth()
  const isAdmin = sessionClaims?.metadata?.role === 'admin'
  const hasDriveAccess = isAdmin || (profile as { drive_access?: boolean } | null)?.drive_access === true
  const hasRequested = (profile as { drive_access_requested?: boolean } | null)?.drive_access_requested === true

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Mon profil</h1>

      <ProfileForm
        profile={profile}
        clerkUser={{
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        }}
      />

      {/* Apparence */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Apparence</h2>
        <ThemeToggle />
      </div>

      {/* Accès Drive */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wider">Enregistrements</h2>
        {hasDriveAccess ? (
          <a
            href="https://drive.google.com/drive/folders/13-iwK8_uWCL9yZc6FpQAhrdvQeaNlcJr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-background px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-light transition-colors w-fit"
          >
            Accéder au Drive des enregistrements
          </a>
        ) : (
          <DriveAccessRequest requested={hasRequested} />
        )}
      </div>
    </div>
  )
}
