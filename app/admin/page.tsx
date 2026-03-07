import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ExternalLink, Shield } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { sessionClaims } = await auth()
  if (sessionClaims?.metadata?.role !== 'admin') redirect('/')

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
        <Shield size={28} className="text-primary" />
        Administration
      </h1>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Informations du groupe</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted">Nom :</span> RGL - Les Disciples</p>
          <p><span className="text-muted">Description :</span> Groupe de jeunes hommes du R&eacute;seau G&eacute;n&eacute;ration Lumi&egrave;re d&apos;AP Samuel qui veulent vivre et d&eacute;montrer Christ &agrave; leur g&eacute;n&eacute;ration.</p>
          <p><span className="text-muted">Objectif :</span> 70 000 disciples de J&eacute;sus d&apos;ici 5 ans</p>
          <p><span className="text-muted">Mission :</span> &Eacute;vang&eacute;liser &amp; Former des disciples</p>
          <p><span className="text-muted">R&eacute;unions :</span> Dimanches &agrave; 21h00</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Liens rapides</h2>
        <div className="space-y-2">
          <a
            href="https://meet.google.com/ppe-fwcd-sbr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-sm"
          >
            <ExternalLink size={14} />
            Google Meet
          </a>
          <a
            href="https://drive.google.com/drive/folders/1ZasHJ4Dl-ga8jWdvVrUevGTqJwPZbiKg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-sm"
          >
            <ExternalLink size={14} />
            Drive enseignements
          </a>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Gestion des r&ocirc;les</h2>
        <p className="text-sm text-muted">
          Pour g&eacute;rer les r&ocirc;les des utilisateurs, rendez-vous dans le{' '}
          <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light">
            dashboard Clerk
          </a>
          {' '}et modifiez les <code className="bg-card-hover px-1 rounded">publicMetadata.role</code> des utilisateurs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/sessions/new" className="bg-card border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-colors">
          <p className="text-primary font-medium">+ Nouvelle session</p>
        </Link>
        <Link href="/membres" className="bg-card border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-colors">
          <p className="text-primary font-medium">G&eacute;rer les membres</p>
        </Link>
      </div>
    </div>
  )
}
