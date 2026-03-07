import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }
  // Auth check only — actual upload goes direct to Supabase Storage from client
  return NextResponse.json({ ok: true })
}
