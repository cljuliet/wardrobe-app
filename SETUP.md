# Wardrobe Planner — Setup Guide

## What you need
- A free Supabase account (supabase.com)
- A free Vercel or Netlify account for hosting

---

## Step 1 — Create your Supabase project

1. Go to supabase.com → sign in → click **New project**
2. Give it any name (e.g. "wardrobe") and set a database password
3. Wait ~1 minute for it to provision

---

## Step 2 — Create the database table

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the contents of `supabase-schema.sql` and click **Run**
4. You should see "Success. No rows returned"

---

## Step 3 — Get your API keys

1. In Supabase, click **Project Settings** (gear icon) → **API**
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
3. Copy the **anon / public** key (the long string under "Project API keys")

---

## Step 4 — Add your keys to the app

Open `src/supabase.js` and replace the two placeholder values:

```js
const SUPABASE_URL  = "https://xxxxxxxxxxxx.supabase.co";  // ← your Project URL
const SUPABASE_ANON = "eyJhbGc...";                         // ← your anon key
```

---

## Step 5 — Deploy to Netlify (easiest)

1. Go to netlify.com → sign up free
2. From your Netlify dashboard, drag the entire `wardrobe-app` folder onto the page
3. Netlify will show "Site is live" with a URL like `wardrobe-planner-abc123.netlify.app`
4. **Important**: Go to Site Settings → Build & Deploy → set **Publish directory** to `dist`
   - Then trigger a new deploy

**Or deploy to Vercel:**
1. Push this folder to a GitHub repo
2. Go to vercel.com → Import Project → select your repo
3. Vercel auto-detects Vite — just click Deploy

---

## Step 6 — Add to iPhone home screen

1. Open your Netlify/Vercel URL in **Safari**
2. Tap the Share button (box with arrow) → **Add to Home Screen**
3. Tap Add

---

## How it works

- Sign in with your email — you'll get a magic link (no password needed)
- Your wardrobe data syncs automatically across all devices via Supabase
- Data is also cached locally so the app loads instantly even on slow connections
- Sign in on any device with the same email to access your wardrobe
