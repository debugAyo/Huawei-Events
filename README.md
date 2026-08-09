# Huawei Events

Event management platform for Huawei. Discover events, register in seconds
(no account needed), and manage everything from an admin panel.

## Features

- **Public event discovery** — home page lists upcoming and past events with
  capacity ("spots left") badges.
- **Event detail pages** — cover image, date/time, venue, price, description,
  live capacity bar and a share-link button.
- **One-click registration** — attendees give name + email (+ optional phone /
  matric no / department) and get an instant confirmation with a reference
  number.
- **Capacity + waitlist** — when an event is full, new registrations are
  automatically waitlisted with their queue position (handled atomically in
  Postgres, so it's safe under load).
- **Short share links (Bitly-style)** — every event gets a unique link
  (`/r/<slug>`) that redirects to the event page and counts clicks.
- **Admin panel** — password-protected dashboard to create, edit, delete
  events, manage registrations (confirm / waitlist / check-in / cancel) and
  export registrations to CSV.
- **Production-ready** — Row Level Security, server-side validation, auth
  session handling, SEO metadata per event.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres database, Row Level Security, Auth, RPC functions
- Deploy anywhere Node is supported (Vercel recommended)

---

## 1. Local setup

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/dashboard) account (free tier is fine)

### Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**

   - Go to <https://supabase.com/dashboard> → **New project**.
   - Name it (e.g. `nihub-events`) and pick a region close to you.

3. **Create the database schema**

   In your Supabase project, open **SQL Editor → New query**, paste the
   contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.

   Then run [`supabase/seed.sql`](supabase/seed.sql) to add 6 sample events.

4. **Create your admin account**

   In **Authentication → Users**, click **Add user** and create an admin
   account with your email and a strong password.

   Then, back in the **SQL Editor**, run (replace the email):

   ```sql
   update public.profiles
   set is_admin = true
   where email = 'you@example.com';
   ```

   This step is automated for you in
   [`supabase/admin.sql`](supabase/admin.sql) — run that file after creating
   the account and set your email in the script.

5. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` — from **Settings → API → Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from **Settings → API → anon public**
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally

6. **Run it**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>. The admin panel is at
   <http://localhost:3000/admin>.

---

## 2. Deploy to production (Vercel)

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new>, import the repo. Vercel auto-detects Next.js.
3. Add the three environment variables (same as `.env.local`), with
   `NEXT_PUBLIC_SITE_URL` set to your production domain.
4. Deploy.

### Custom domain for short links

To make share links look like `nihub.events/x7k2m` instead of
`vercel.app/...`:

1. Buy a domain (e.g. via Namecheap) and add it in **Vercel → Project →
   Settings → Domains**.
2. Set `NEXT_PUBLIC_SITE_URL` to `https://nihub.events` and redeploy.

---

## 3. Project structure

```
supabase/
  schema.sql          # tables, RLS policies, RPC functions
  seed.sql            # sample events
src/
  middleware → proxy.ts  # session refresh + /admin route guard
  lib/
    supabase/         # browser + server clients, session handling
    admin.ts          # admin guard for pages/actions
    types.ts          # shared types
    utils.ts          # formatting, slugs, helpers
  app/
    (public)/         # home, event detail, /r/[slug] short links
    admin/            # login, dashboard, event CRUD, registrations
    actions.ts        # server actions (register, create/update/delete…)
  components/         # UI components
```

## 4. Operations notes

- **Duplicate registration** — the same email can only register once per
  event; the waitlist uses the same rule.
- **Freeing a seat** — cancelling a confirmed registration frees a slot for
  the first waitlisted person (promote them manually in the admin panel).
- **Cover images** — paste any public image URL (e.g. Unsplash). Uploads are
  out of scope; use Supabase Storage or an image host if needed.
- **Security** — RLS means the public can only read published events and
  insert registrations. Admin actions run through authenticated, admin-checked
  server actions.
