import { auth } from '@clerk/nextjs/server'
import { getServiceSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { sessionId } = await req.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId manquant' }, { status: 400 })
  }

  const db = getServiceSupabase()

  // Get current session to find audio path
  const { data: session } = await db.from('sessions').select('audio_url').eq('id', sessionId).single()

  if (session?.audio_url) {
    // Extract path from URL
    const url = new URL(session.audio_url)
    const pathMatch = url.pathname.match(/\/object\/public\/audios\/(.+)/)
    if (pathMatch) {
      await db.storage.from('audios').remove([pathMatch[1]])
    }
  }

  const { error } = await db.from('sessions').update({ audio_url: null }).eq('id', sessionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/sessions')
  return NextResponse.json({ ok: true })
}
