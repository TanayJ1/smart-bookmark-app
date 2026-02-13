# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign in with Google OAuth, add bookmarks, and see updates in real-time across multiple tabs.

## Features

✅ **Google OAuth Authentication** - Sign up and log in using Google (no email/password)  
✅ **Private Bookmarks** - Each user can only see their own bookmarks  
✅ **Real-time Updates** - Bookmarks sync instantly across all open tabs  
✅ **CRUD Operations** - Create and delete bookmarks with URL and title  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Deployed on Vercel** - Live production URL  

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript** (Type safety)

## Live Demo

🔗 [Live App URL - To be added after deployment]

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-bookmark-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready

#### Create the Bookmarks Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
```

#### Enable Realtime

1. Go to Database → Replication in Supabase
2. Enable replication for the `bookmarks` table

#### Configure Google OAuth

1. Go to Authentication → Providers in Supabase
2. Enable Google provider
3. Add your authorized redirect URLs:
   - For local: `http://localhost:3000/auth/callback`
   - For production: `https://your-app.vercel.app/auth/callback`
4. Get your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
5. Add them to Supabase

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from Supabase → Project Settings → API

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

After deployment, add your Vercel URL to Supabase:
- Go to Authentication → URL Configuration
- Add your Vercel URL to Site URL and Redirect URLs

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with auth & bookmarks
│   └── globals.css         # Global styles
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Problems Encountered & Solutions

### 1. Real-time Updates Not Working
**Problem:** Bookmarks weren't updating in real-time across tabs.

**Solution:** 
- Enabled Realtime in Supabase for the bookmarks table
- Implemented Supabase Realtime subscription using `supabase.channel()`
- Added proper event listeners for INSERT and DELETE operations
- Made sure to filter updates by `user_id` to only receive relevant updates

### 2. Google OAuth Redirect Issues
**Problem:** After Google login, users were redirected to a 404 page.

**Solution:**
- Configured proper redirect URLs in both Supabase and Google Cloud Console
- Used Supabase Auth UI library which handles OAuth flow automatically
- Set up the callback URL as `/auth/callback`

### 3. Row Level Security (RLS) Policies
**Problem:** Users could potentially see other users' bookmarks.

**Solution:**
- Implemented RLS policies on the bookmarks table
- Created separate policies for SELECT, INSERT, and DELETE operations
- Each policy checks that `auth.uid() = user_id` to ensure privacy

### 4. State Management for Real-time Updates
**Problem:** Adding a bookmark would sometimes show duplicates due to both the insert response and real-time subscription.

**Solution:**
- Used the real-time subscription to handle all updates
- Let Supabase push new bookmarks through the subscription instead of manually adding them
- This ensures consistency across all tabs

### 5. TypeScript Type Safety
**Problem:** Type errors with Supabase responses.

**Solution:**
- Created a `Bookmark` type interface
- Properly typed all Supabase queries and responses
- Used TypeScript strict mode for better type checking

## Key Features Implementation

### Google OAuth Only
- Used `onlyThirdPartyProviders` prop in Supabase Auth UI
- Specified `providers={['google']}` to show only Google sign-in

### Private Bookmarks
- Implemented Row Level Security (RLS) policies
- Each query filters by `user_id`
- Database enforces privacy at the data layer

### Real-time Updates
- Used Supabase Realtime subscriptions
- Listens to INSERT and DELETE events
- Updates state immediately when changes occur
- Works across multiple browser tabs

### Delete Functionality
- Simple delete button on each bookmark
- Uses Supabase delete query with user_id check
- Real-time subscription updates all tabs automatically

## Testing

To test the real-time functionality:
1. Open the app in two different browser tabs
2. Sign in with the same Google account
3. Add a bookmark in one tab
4. Watch it appear instantly in the other tab
5. Delete a bookmark in one tab
6. See it disappear in the other tab

## Future Improvements

- Add bookmark editing functionality
- Implement folders/categories
- Add tags and search
- Export bookmarks
- Bookmark favicons
- Sharing bookmarks with other users

## License

MIT
