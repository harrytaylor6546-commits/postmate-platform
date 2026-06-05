# PostMate Platform

Self-serve AI content platform for local businesses. Clients sign up, set up their profile once, and generate a full month of content in 60 seconds — every month.

## Stack
- **Next.js 14** (App Router)
- **Clerk** — authentication
- **Supabase** — database (profiles + content history)
- **Anthropic Claude** — content generation (server-side)
- **Stripe** — subscriptions (add when ready)
- **Vercel** — hosting

## Setup (15 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Clerk (free at clerk.com)
- Create account → Create application
- Copy publishable key and secret key
- Set redirect URLs: after sign-in → /dashboard, after sign-up → /onboarding

### 3. Set up Supabase (free at supabase.com)
- Create account → New project
- Go to SQL Editor → New query → paste contents of lib/schema.sql → Run
- Copy project URL and anon key from Settings → API

### 4. Get Anthropic API key (console.anthropic.com)

### 5. Create .env.local
```bash
cp .env.local.example .env.local
# Fill in all values
```

### 6. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo at vercel.com
3. Add all environment variables from .env.local
4. Deploy

## User flow
1. Client visits landing page → clicks "Start Free Trial"
2. Redirected to /sign-up (Clerk handles auth)
3. After signup → /onboarding (6-step wizard)
4. After onboarding → /dashboard
5. Each month: /generate → add updates → click Generate → view at /history

## Pages
- `/` — redirects to /dashboard (if logged in) or /sign-in
- `/sign-in` — Clerk sign in
- `/sign-up` — Clerk sign up  
- `/onboarding` — 6-step profile setup wizard
- `/dashboard` — home with monthly CTA
- `/generate` — content generation form
- `/history` — view all generated content with section tabs
- `/settings` — edit business profile and images

## API Routes
- `POST /api/profile` — create/upsert profile (onboarding)
- `PATCH /api/profile` — update profile (settings)
- `GET /api/profile` — get profile
- `POST /api/generate` — generate content (calls Claude, saves to DB)
