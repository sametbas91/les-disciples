# Impact Disciple - Dashboard

Dashboard de gestion des sessions d'enseignement hebdomadaires du groupe **RGL - Impact Disciple**.

## Stack technique

- **Next.js 15** (App Router, Server Actions)
- **Supabase** (PostgreSQL)
- **Clerk** (Authentification)
- **Tailwind CSS v4** + composants custom
- **Recharts** (graphiques)
- **TypeScript**

## Deploiement pas a pas

### 1. Creer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et creez un compte gratuit
2. Creez un nouveau projet
3. Allez dans **SQL Editor** et executez le contenu du fichier `scripts/schema.sql`
4. Recuperez vos cles dans **Settings > API** :
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

### 2. Creer un projet Clerk

1. Rendez-vous sur [clerk.com](https://clerk.com) et creez un compte gratuit
2. Creez une nouvelle application
3. Activez les providers souhaites (Google, Email)
4. Recuperez vos cles dans **API Keys** :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Pour definir un admin, allez dans **Users**, selectionnez l'utilisateur, et ajoutez dans **Public Metadata** :
   ```json
   { "role": "admin" }
   ```

### 3. Configurer les variables d'environnement

Creez un fichier `.env.local` a la racine du projet :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Lancer en local

```bash
npm install
npm run dev
```

### 5. Inserer les donnees historiques (seed)

```bash
npm run seed
```

### 6. Deployer sur Vercel

1. Poussez le code sur GitHub
2. Rendez-vous sur [vercel.com](https://vercel.com)
3. Importez le repository GitHub
4. Ajoutez toutes les variables d'environnement dans les settings Vercel
5. Deployez !

## Structure du projet

```
app/
  page.tsx              -> Dashboard principal
  sessions/page.tsx     -> Liste des sessions
  sessions/[id]/page.tsx-> Detail d'une session
  sessions/new/page.tsx -> Creer/modifier une session (admin)
  membres/page.tsx      -> Annuaire des membres
  admin/page.tsx        -> Panneau admin
components/
  dashboard/            -> KPIs, graphiques, anniversaires
  sessions/             -> Formulaires, listes, boutons
  members/              -> Liste et gestion des membres
  comments/             -> Section commentaires
  layout/               -> Navbar, recherche
lib/
  supabase.ts           -> Client Supabase + types
  actions.ts            -> Server Actions (CRUD)
  utils.ts              -> Utilitaires (formatage dates, etc.)
scripts/
  schema.sql            -> Schema SQL pour Supabase
  seed.ts               -> Donnees initiales
```
