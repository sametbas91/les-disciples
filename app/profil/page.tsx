import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import ProfileForm from '@/components/profile/ProfileForm'

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Mon profil</h1>
      <ProfileForm
        profile={profile}
        clerkUser={{
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl,
        }}
      />
    </div>
  )
}
