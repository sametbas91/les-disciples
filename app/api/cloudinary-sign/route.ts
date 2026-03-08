import { auth } from '@clerk/nextjs/server'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { publicId, folder } = await req.json()

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY
  if (!apiSecret || !apiKey) {
    return NextResponse.json({ error: 'Cloudinary non configuré' }, { status: 500 })
  }

  const timestamp = Math.floor(Date.now() / 1000)

  // Paramètres à signer (ordre alphabétique)
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex')

  return NextResponse.json({ timestamp, signature, apiKey })
}
