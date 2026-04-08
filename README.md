# RemplApp

Application web mobile-first de gestion des vacations de remplacement et simulation fiscale pour les internes en radiologie (France).

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **Tailwind CSS** — palette vert sapin / or mat
- **Supabase** — Auth + PostgreSQL + RLS
- **IndexedDB (idb)** — stockage offline avec sync automatique

---

## Mise en route

### 1. Prérequis

- Node.js ≥ 18
- Compte Supabase (gratuit) : [supabase.com](https://supabase.com)
- Compte Vercel (gratuit) : [vercel.com](https://vercel.com)

### 2. Variables d'environnement

```bash
cp env.example .env.local
```

Remplir dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clé anon publique
- `SUPABASE_SERVICE_ROLE_KEY` — Clé service (côté serveur uniquement)

Ces valeurs se trouvent dans **Supabase > Project Settings > API**.

### 3. Base de données Supabase

Exécuter la migration dans l'éditeur SQL Supabase :

```
supabase/migrations/001_initial_schema.sql
```

Cela crée les tables `profiles`, `structures`, `vacations` avec RLS activé et les triggers `updated_at` + création automatique du profil à l'inscription.

### 4. Lancer en développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Déploiement Vercel

1. Pousser le code sur GitHub
2. Importer le dépôt sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement dans **Vercel > Settings > Environment Variables**
4. Déployer

---

## Architecture

```
app/
  (auth)/       — login, register, forgot-password, reset-password
  (app)/        — dashboard, vacations, structures, profil (protégé)
  api/          — routes serveur (suppression compte RGPD)

components/
  ui/           — Button, Card, Badge, Input, Select, PageHeader
  layout/       — Navbar (mobile bottom + desktop sidebar), SyncBanner
  dashboard/    — KPIs, URSSAF, simulation IR
  vacations/    — Liste, calendrier, formulaire, carte
  structures/   — Liste, formulaire, détail
  profil/       — Formulaire fiscal

lib/
  supabase/     — Clients browser/server/middleware
  db/           — IndexedDB (idb) — stockage offline
  repositories/ — CRUD abstrait (local + Supabase avec fallback)
  fiscalite/    — Calculs URSSAF, IR, parts fiscales (fonctions pures)
  hooks/        — useVacations, useStructures, useProfile, useUser, useOnlineStatus

types/          — Interfaces TypeScript centralisées
supabase/       — Migration SQL initiale
```

## Règles fiscales implémentées

- **URSSAF RSPM** : palier 1 (≤ 19 000 € → 13,5%) / palier 2 (≤ 38 000 € → 21,2%)
- **IR 2025** : barème progressif, quotient familial, abattement BNC 34% (forfaitaire)
- **Parts fiscales** : calcul automatique (situation familiale + enfants garde complète/alternée + parent isolé)
- **CARMF-RID** : Classe A 25% (158 €) ou pleine (631 €)

> **Simulation indicative — ne remplace pas un expert-comptable.**
