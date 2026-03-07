import { auth } from '@clerk/nextjs/server'
import { getServiceSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { sessionId, audioUrl } = await req.json()
  if (!sessionId || !audioUrl) {
    return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
  }

  const db = getServiceSupabase()
  const { error } = await db.from('sessions').update({ audio_url: audioUrl }).eq('id', sessionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/sessions')
  return NextResponse.json({ ok: true })
}
