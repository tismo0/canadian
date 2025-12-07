# Canadian Burger & Pizza - Spa, Belgique

Application de commande en ligne Click & Collect avec paiement Stripe et QR Code de retrait.

## 🚀 Stack Technique

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Auth & DB**: Supabase (Auth + PostgreSQL + Storage)
- **Paiement**: Stripe Checkout avec PaymentIntents
- **Testing**: Jest + React Testing Library + Playwright

## 📋 Prérequis

- Node.js 18+ et npm 9+
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Stripe](https://stripe.com) (mode test)
- Compte [Vercel](https://vercel.com) pour le déploiement

## 🛠️ Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Cliquer "New Project"
3. **Nom**: `canadian-burger-spa`
4. **Mot de passe DB**: Générer et sauvegarder
5. **Région**: `eu-west-1` (Frankfurt) pour la Belgique
6. Cliquer "Create new project"

### 2. Exécuter les migrations SQL

1. Dans Supabase Dashboard → SQL Editor
2. Copier le contenu de `supabase/migrations.sql`
3. Exécuter le script

### 3. Configurer l'authentification

1. Authentication → Providers
2. Activer "Email" (déjà par défaut)
3. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) ou votre domaine
   - Redirect URLs: Ajouter `http://localhost:3000/auth/callback`

### 4. Configurer le Storage

1. Storage → Create new bucket
2. Nom: `products`
3. Public: ✅ Oui
4. Politiques: Ajouter les politiques RLS du fichier migrations

### 5. Récupérer les clés API

1. Settings → API
2. Copier:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 🔑 Configuration Stripe

### 1. Créer les clés API

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copier:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 2. Configurer le Webhook

1. Developers → Webhooks → Add endpoint
2. URL: `https://votre-domaine.vercel.app/api/stripe/webhook`
3. Événements:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copier le Signing secret → `STRIPE_WEBHOOK_SECRET`

**Pour le développement local avec Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📁 Variables d'environnement

Créer `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security - Générer avec: openssl rand -hex 32
SECRET_HMAC=votre_secret_hmac_32_caracteres

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Installation

```bash
# Cloner le projet
git clone <repo-url>
cd cbp

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📜 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter ESLint
npm run test         # Tests unitaires (Jest)
npm run test:watch   # Tests en mode watch
npm run test:e2e     # Tests E2E (Playwright)
```

## 🏗️ Structure du projet

```
cbp/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Routes d'authentification
│   ├── (main)/            # Routes principales
│   ├── admin/             # Panel admin (protégé)
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── ProductCard.tsx
│   ├── Cart.tsx
│   └── QRDisplay.tsx
├── contexts/              # React Contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilitaires
│   ├── supabase.ts       # Client Supabase
│   ├── stripe.ts         # Client Stripe
│   ├── qr.ts             # Génération QR
│   └── validations/      # Schémas Zod
├── types/                 # Types TypeScript
├── supabase/             # Migrations SQL
├── __tests__/            # Tests unitaires
├── e2e/                  # Tests E2E Playwright
└── public/               # Assets statiques
```

## 🔐 Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `customer` | Menu, Panier, Commandes, Profil |
| `staff` | + Scanner QR, Voir commandes |
| `admin` | + CRUD produits, Stats, Logs |

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil avec hero et produits vedettes |
| `/menu` | Catalogue complet avec filtres |
| `/menu/[id]` | Détail produit |
| `/cart` | Panier |
| `/checkout` | Tunnel de paiement |
| `/confirmation/[orderId]` | Confirmation + QR Code |
| `/account` | Profil et historique |
| `/admin` | Dashboard admin |
| `/admin/products` | Gestion produits |
| `/admin/orders/[id]` | Détail commande |

## 🧪 Tests

### Tests unitaires
```bash
npm run test
```

### Tests E2E
```bash
# Installer les navigateurs Playwright
npx playwright install

# Exécuter les tests
npm run test:e2e

# Mode UI
npx playwright test --ui
```

## 🚢 Déploiement Vercel

### Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Via Git
1. Push sur GitHub/GitLab
2. Importer dans Vercel
3. Configurer les variables d'environnement
4. Deploy!

### Variables à configurer dans Vercel
- Toutes les variables de `.env.local`
- Changer `NEXT_PUBLIC_APP_URL` vers le domaine Vercel

## 📄 Licence

Propriétaire - Canadian Burger & Pizza Spa © 2024
