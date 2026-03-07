'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

export default function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ type: string; id: string; label: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }

    const search = async () => {
      const [members, sessions] = await Promise.all([
        supabase.from('members').select('id, name').ilike('name', `%${query}%`).limit(5),
        supabase.from('sessions').select('id, theme, date').ilike('theme', `%${query}%`).limit(5),
      ])

      const r: { type: string; id: string; label: string }[] = []
      members.data?.forEach((m) => r.push({ type: 'member', id: m.id, label: m.name }))
      sessions.data?.forEach((s) =>
        r.push({ type: 'session', id: s.id, label: `${s.theme} (${new Date(s.date).toLocaleDateString('fr-FR')})` })
      )
      setResults(r)
    }
    search()
  }, [query])

  const handleSelect = (item: { type: string; id: string }) => {
    if (item.type === 'member') router.push('/membres')
    else router.push(`/sessions/${item.id}`)
    onClose()
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-card-hover rounded-lg px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          type="text"
          placeholder="Rechercher un membre ou une session..."
          className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-2 hover:bg-card-hover text-sm flex items-center gap-2"
            >
              <span className={`text-xs px-2 py-0.5 rounded ${r.type === 'member' ? 'bg-primary/20 text-primary' : 'bg-invite/20 text-muted'}`}>
                {r.type === 'member' ? 'Membre' : 'Session'}
              </span>
              <span className="text-foreground">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
