import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DISCIPLES = [
  'Chris', 'Church-Hill', 'David', 'Farrel', 'Hadriano', 'Harold', 'Keny',
  'Larios', 'Louis', 'Marco', 'Messy', 'Randy', 'Ridi', 'Samuel', 'Sobdorson',
]

const INVITES = [
  'Abel Clouch', 'Alicia M', 'Alicia D', 'Bedou', 'Djody', 'Doriane', 'Emy',
  'Esther', 'Evans', 'Freeman', 'Jaymay/Warren', 'Ketsia', 'Kim-gaye Karla',
  'Laura', 'Luigi', 'Luriane', 'Malcolm', 'Mardochée', 'Merveille', 'Mitchiiz',
  'Noémie', 'Ornelly', 'Samba Jeremy', 'Sephora', 'Shelby', 'Steve Angoran',
  'Stevens', 'Victor', 'Victoriane',
]

// Dylan, Ethan, Leonce are also Disciples to add
const EXTRA_DISCIPLES = ['Dylan', 'Ethan', 'Léonce']

const BIRTHDAYS: Record<string, string> = {
  'Hadriano': '2000-02-04',
  'Randy': '2000-02-17',
  'Louis': '2000-02-19',
  'Larios': '2000-02-27',
  'Keny': '2000-05-04',
  'Harold': '2000-07-07',
  'David': '2000-07-30',
  'Samuel': '2000-08-06',
  'Ridi': '2000-09-06',
  'Dylan': '2000-09-29',
  'Farrel': '2000-10-01',
  'Chris': '2000-10-17',
  'Church-Hill': '2000-10-27',
  'Sobdorson': '2000-11-04',
  'Messy': '2000-12-24',
  'Ethan': '2000-04-13',
  'Léonce': '2000-09-09',
  'Marco': '2000-05-23',
}

type SessionData = {
  date: string
  theme: string
  duration: number
  presents: string[]
  firstTimers?: string[]
}

const SESSIONS: SessionData[] = [
  {
    date: '2026-01-25',
    theme: "Le type de prière qui n'échoue jamais",
    duration: 120,
    presents: ['Alicia M', 'Bedou', 'Chris', 'Church-Hill', 'David', 'Doriane', 'Emy', 'Harold', 'Keny', 'Ketsia', 'Marco', 'Merveille', 'Messy', 'Ornelly', 'Randy', 'Ridi', 'Samuel', 'Sobdorson', 'Stevens', 'Victor'],
  },
  {
    date: '2026-02-01',
    theme: "Le type d'hommes dont le monde a besoin",
    duration: 180,
    presents: ['Alicia M', 'Bedou', 'Chris', 'Church-Hill', 'David', 'Freeman', 'Hadriano', 'Harold', 'Keny', 'Ketsia', 'Kim-gaye Karla', 'Laura', 'Luriane', 'Malcolm', 'Marco', 'Merveille', 'Messy', 'Mitchiiz', 'Ornelly', 'Randy', 'Ridi', 'Samuel', 'Shelby', 'Sobdorson', 'Stevens', 'Victor', 'Victoriane'],
  },
  {
    date: '2026-02-08',
    theme: 'Les relations',
    duration: 160,
    presents: ['Alicia D', 'Bedou', 'Chris', 'Church-Hill', 'David', 'Emy', 'Harold', 'Keny', 'Ketsia', 'Kim-gaye Karla', 'Luriane', 'Marco', 'Messy', 'Ornelly', 'Randy', 'Ridi', 'Samuel', 'Sobdorson', 'Stevens', 'Louis', 'Djody', 'Steve Angoran', 'Esther', 'Alicia M', 'Sephora', 'Noémie'],
  },
  {
    date: '2026-02-15',
    theme: 'Témoignages',
    duration: 210,
    presents: ['Bedou', 'Chris', 'Church-Hill', 'David', 'Emy', 'Hadriano', 'Harold', 'Keny', 'Kim-gaye Karla', 'Marco', 'Merveille', 'Messy', 'Ornelly', 'Randy', 'Ridi', 'Samuel', 'Sobdorson', 'Victoriane', 'Louis', 'Alicia M'],
  },
  {
    date: '2026-02-22',
    theme: 'Deviens extraordinaire comme Jésus',
    duration: 198,
    presents: ['Alicia M', 'Bedou', 'Chris', 'Church-Hill', 'David', 'Emy', 'Esther', 'Farrel', 'Freeman', 'Hadriano', 'Harold', 'Jaymay/Warren', 'Keny', 'Ketsia', 'Kim-gaye Karla', 'Laura', 'Louis', 'Luriane', 'Marco', 'Merveille', 'Messy', 'Randy', 'Ridi', 'Samuel', 'Sobdorson', 'Steve Angoran', 'Stevens', 'Victor', 'Victoriane', 'Mardochée'],
    firstTimers: ['Mardochée'],
  },
  {
    date: '2026-03-01',
    theme: "Le discipolat : la clé divine pour transformer l'humanité",
    duration: 180,
    presents: ['Abel Clouch', 'Alicia M', 'Chris', 'Church-Hill', 'David', 'Hadriano', 'Harold', 'Jaymay/Warren', 'Keny', 'Kim-gaye Karla', 'Louis', 'Luriane', 'Malcolm', 'Marco', 'Messy', 'Ornelly', 'Randy', 'Ridi', 'Samuel', 'Sobdorson', 'Stevens', 'Victor', 'Victoriane', 'Larios', 'Luigi', 'Samba Jeremy', 'Evans'],
    firstTimers: ['Evans', 'Samba Jeremy', 'Luigi', 'Larios'],
  },
]

async function seed() {
  console.log('Seeding database...')

  // Insert members
  const allMembers = [
    ...DISCIPLES.map((name) => ({ name, status: 'Disciple', birthday: BIRTHDAYS[name] || null })),
    ...EXTRA_DISCIPLES.map((name) => ({ name, status: 'Disciple', birthday: BIRTHDAYS[name] || null })),
    ...INVITES.map((name) => ({ name, status: 'Invité(e)', birthday: BIRTHDAYS[name] || null })),
  ]

  const { data: members, error: mErr } = await supabase
    .from('members')
    .upsert(allMembers, { onConflict: 'name' })
    .select()

  if (mErr) {
    console.error('Error inserting members:', mErr)
    // Try insert instead
    const { data: members2, error: mErr2 } = await supabase.from('members').insert(allMembers).select()
    if (mErr2) { console.error('Error:', mErr2); return }
    await insertSessions(members2!)
    return
  }

  await insertSessions(members!)
}

async function insertSessions(members: { id: string; name: string }[]) {
  const memberMap = new Map(members.map((m) => [m.name, m.id]))

  for (const s of SESSIONS) {
    const { data: session, error: sErr } = await supabase
      .from('sessions')
      .insert({ date: s.date, theme: s.theme, duration: s.duration })
      .select()
      .single()

    if (sErr) { console.error('Session error:', sErr); continue }

    const attendances = s.presents
      .map((name) => {
        // Handle "Alicia" matching "Alicia M"
        let id = memberMap.get(name)
        if (!id) {
          // Try partial match
          for (const [mName, mId] of memberMap) {
            if (mName.startsWith(name) || name.startsWith(mName)) {
              id = mId
              break
            }
          }
        }
        if (!id) { console.warn(`Member not found: ${name}`); return null }
        return {
          session_id: session.id,
          member_id: id,
          is_first_time: s.firstTimers?.includes(name) || false,
        }
      })
      .filter(Boolean)

    if (attendances.length > 0) {
      const { error: aErr } = await supabase.from('attendances').insert(attendances)
      if (aErr) console.error('Attendance error:', aErr)
    }

    console.log(`Session "${s.theme}" seeded with ${attendances.length} attendees`)
  }

  console.log('Seeding complete!')
}

seed()
