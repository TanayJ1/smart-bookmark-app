# Deployment Guide

## Step-by-Step Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free)

### 1. Prepare Supabase

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and name your project
   - Wait for database to initialize

2. **Set Up Database**
   - Go to SQL Editor
   - Copy and paste contents from `supabase-setup.sql`
   - Click "Run"

3. **Enable Realtime**
   - Go to Database → Replication
   - Find "bookmarks" table
   - Toggle ON the replication

4. **Configure Google OAuth**
   - Go to Authentication → Providers
   - Enable Google
   - Click on Google to configure
   - You'll need:
     - Client ID from Google Cloud Console
     - Client Secret from Google Cloud Console

5. **Get Google OAuth Credentials**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable Google+ API
   - Go to Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

6. **Get API Keys**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - Anon public key

### 2. Prepare GitHub Repository

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com
   - Click "New repository"
   - Name it "smart-bookmark-app"
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/smart-bookmark-app.git
   git branch -M main
   git push -u origin main
   ```

### 3. Deploy to Vercel

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select "smart-bookmark-app"

2. **Configure Project**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Get your deployment URL: `https://your-app.vercel.app`

### 4. Final Supabase Configuration

1. **Update Redirect URLs**
   - Go back to Supabase
   - Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: Add `https://your-app.vercel.app/**`

2. **Update Google OAuth**
   - Go to Google Cloud Console
   - Your OAuth Client
   - Authorized redirect URIs
   - Add: `https://your-project.supabase.co/auth/v1/callback`

### 5. Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Authorize the app
4. Add a bookmark
5. Open in another tab and verify real-time sync works

## Troubleshooting

### Google OAuth Not Working
- Check redirect URLs match exactly
- Verify Google OAuth credentials in Supabase
- Make sure Google+ API is enabled
- Check browser console for errors

### Real-time Not Working
- Verify Realtime is enabled in Supabase
- Check browser console for subscription errors
- Ensure RLS policies are correct

### Build Fails on Vercel
- Check environment variables are set
- Verify package.json has all dependencies
- Check build logs for specific errors

### 404 After Login
- Update Site URL in Supabase
- Add redirect URLs with `/**` wildcard
- Clear browser cache and try again

## Updating Your App

To push updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically rebuild and deploy your changes.

## Custom Domain (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration steps
5. Update Supabase URLs to include custom domain

## Monitoring

- Vercel Dashboard: Monitor deployments and traffic
- Supabase Dashboard: Monitor database usage and auth
- Check logs in both platforms for debugging

## Cost

Both Supabase and Vercel offer generous free tiers:
- Vercel Free: Unlimited deployments, 100GB bandwidth
- Supabase Free: 500MB database, 2GB file storage, 50K monthly active users

Your bookmark app should comfortably fit within these limits.
