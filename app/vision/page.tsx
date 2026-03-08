import PhotoMosaic from '@/components/vision/PhotoMosaic'
import AnimatedCounter from '@/components/vision/AnimatedCounter'
import { Target, Megaphone, Shield, Flame } from 'lucide-react'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function VisionPage() {
  const db = getServiceSupabase()
  const [{ data: sessions }, { data: members }] = await Promise.all([
    db.from('sessions').select('duration'),
    db.from('members').select('status'),
  ])

  const totalSessions = sessions?.length || 25
  const totalHours = Math.round((sessions?.reduce((s, x) => s + x.duration, 0) || 0) / 60)
  const disciples = members?.filter((m) => m.status === 'Disciple').length || 0

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black px-6">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #6c63ff 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #2ecc71 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <Flame size={14} />
            Groupe de disciples — Paris &amp; Île-de-France
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Impact<br />
            <span className="text-primary">Disciple</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Des jeunes hommes qui ont décidé de vivre et de démontrer Christ à leur génération.
            Pas des spectateurs — des acteurs.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-card border-y border-border px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: totalSessions, suffix: '', label: 'Sessions tenues', color: 'text-primary' },
            { value: totalHours, suffix: 'h', label: "D'enseignement", color: 'text-primary' },
            { value: 70000, suffix: '', label: 'Objectif disciples', color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className={`text-4xl sm:text-5xl font-black ${stat.color}`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-muted text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MOSAÏQUE PHOTOS ── */}
      <section className="bg-background px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-6 text-center">Nos moments</p>
          <PhotoMosaic />
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="relative overflow-hidden px-6 py-20"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d0d0d 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">La Vision</p>
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
                70 000<br />
                <span className="text-primary">disciples</span><br />
                de Jésus
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-4">
                D&apos;ici 5 ans, notre objectif est de contribuer à faire naître 70 000 disciples de Jésus-Christ — des hommes et des femmes transformés, enracinés dans la Parole et envoyés dans leur génération.
              </p>
              <p className="text-white/60 text-base leading-relaxed">
                Ce n&apos;est pas un rêve. C&apos;est une commission. Et nous avons décidé d&apos;y répondre.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: <Target size={20} />,
                  title: 'Un objectif clair',
                  text: "70 000 disciples en 5 ans. Chaque session, chaque enseignement, chaque conversation compte.",
                  color: 'text-primary bg-primary/10 border-primary/20',
                },
                {
                  icon: <Megaphone size={20} />,
                  title: 'Évangéliser 📢',
                  text: "Porter la bonne nouvelle à notre génération, là où elle est : dans les rues, les universités, les réseaux.",
                  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                },
                {
                  icon: <Shield size={20} />,
                  title: 'Former des disciples 🪖',
                  text: "Pas juste des convertis — des soldats. Des hommes formés, nourris et envoyés.",
                  color: 'text-disciple bg-disciple/10 border-disciple/20',
                },
              ].map((item, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border backdrop-blur-sm ${item.color}`}>
                  <div className="shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUI SOMMES-NOUS ── */}
      <section className="bg-card border-t border-border px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Qui sommes-nous</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Pas un club — une armée</h2>
            <p className="text-muted max-w-2xl mx-auto leading-relaxed">
              Impact Disciple est un groupe de jeunes hommes du RGL d&apos;AP Samuel basé en région parisienne. Chaque dimanche soir, nous nous réunissons pour être enseignés, challengés et envoyés.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '📖', title: 'La Parole au centre', text: "Chaque session est construite autour de la Bible. Pas d'opinions — des vérités." },
              { emoji: '🤝', title: 'La fraternité réelle', text: "On mange ensemble, on joue ensemble, on grandit ensemble. La vie en communauté n'est pas optionnelle." },
              { emoji: '🚀', title: "L'envoi en mission", text: "On ne se réunit pas pour se garder entre nous. On se forme pour être envoyés." },
            ].map((item, i) => (
              <div key={i} className="bg-card-hover rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
