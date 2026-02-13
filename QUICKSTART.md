# Quick Start Guide

Get your Smart Bookmark App running in under 10 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Google account
- GitHub account (for deployment)

## 5-Minute Local Setup

### 1. Install Dependencies (1 min)

```bash
npm install
```

### 2. Set Up Supabase (3 min)

1. Go to https://supabase.com and create free account
2. Click "New Project"
3. Name it "bookmarks" (or anything you like)
4. Choose a database password
5. Select region closest to you
6. Click "Create new project"
7. Wait ~2 minutes for database to initialize

### 3. Configure Database (1 min)

1. In Supabase, go to "SQL Editor"
2. Open `supabase-setup.sql` from this project
3. Copy all SQL and paste in Supabase SQL Editor
4. Click "Run"
5. Go to Database → Replication
6. Enable replication for "bookmarks" table

### 4. Set Up Google OAuth (2 min)

1. In Supabase, go to Authentication → Providers
2. Enable "Google"
3. Go to https://console.cloud.google.com
4. Create new project (or use existing)
5. Enable "Google+ API"
6. Create OAuth 2.0 credentials
7. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
8. Copy Client ID and Secret to Supabase

### 5. Add Environment Variables (30 sec)

1. Copy `.env.local.example` to `.env.local`
2. Get your Supabase URL and Anon Key from Project Settings → API
3. Paste them in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run the App! (30 sec)

```bash
npm run dev
```

Open http://localhost:3000

🎉 Done! You should see the login page.

## 5-Minute Deployment to Vercel

### 1. Push to GitHub (1 min)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smart-bookmark-app.git
git push -u origin main
```

### 2. Deploy to Vercel (2 min)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### 3. Update Supabase URLs (1 min)

1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. In Supabase, go to Authentication → URL Configuration
3. Add to Site URL and Redirect URLs
4. In Google Cloud Console, add Vercel URL to authorized origins

### 4. Test! (1 min)

Visit your Vercel URL and test the app!

## Verify Everything Works

- [ ] Can sign in with Google
- [ ] Can add a bookmark
- [ ] Can delete a bookmark
- [ ] Open two tabs, add bookmark in one, see it in the other
- [ ] Sign out works

## Need Help?

- Check `TESTING.md` for detailed test scenarios
- Check `DEPLOYMENT.md` for detailed deployment steps
- Check `README.md` for troubleshooting

## Next Steps

Now that your app is running:

1. Customize the styling in `app/globals.css`
2. Add more features (edit, search, tags)
3. Share your live URL!

## Common First-Time Issues

**Can't sign in with Google?**
- Make sure redirect URLs match exactly in Supabase and Google Console
- Check that Google+ API is enabled

**Bookmarks not showing?**
- Check browser console for errors
- Verify RLS policies were created (run SQL again)
- Make sure you're signed in

**Real-time not working?**
- Enable Replication for bookmarks table in Supabase
- Check browser console for subscription errors

## Architecture Overview

```
User → Next.js App → Supabase Auth (Google OAuth)
                  → Supabase Database (PostgreSQL)
                  → Supabase Realtime (WebSocket)
```

## File Structure

```
app/
  page.tsx          ← Main app component
  layout.tsx        ← Root layout
  globals.css       ← Styles
lib/
  supabase.ts       ← Supabase client
```

That's it! Happy bookmarking! 🔖
