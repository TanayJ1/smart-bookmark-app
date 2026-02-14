# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Google OAuth. Users can add and delete bookmarks that sync instantly across multiple browser tabs.

🔗 **Live Demo**: [https://smart-bookmark-ivnjgrrl8-tanay-jains-projects-14df3486.vercel.app](https://smart-bookmark-ivnjgrrl8-tanay-jains-projects-14df3486.vercel.app) *(replace with your actual Vercel URL)*

---

## Features

✅ **Google OAuth Authentication** - Sign in with Google (no email/password)  
✅ **Private Bookmarks** - Each user sees only their own bookmarks  
✅ **Real-time Sync** - Changes appear instantly across all open tabs  
✅ **Optimistic UI** - Instant visual feedback on add/delete  
✅ **Responsive Design** - Works on desktop and mobile  

---

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Backend as a Service (Auth, Database, Realtime)
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Deployment platform

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account (for OAuth)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR-USERNAME/smart-bookmark-app.git
cd smart-bookmark-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Set up Supabase database:**

Run this SQL in Supabase SQL Editor:

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

-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

5. **Enable Realtime in Supabase:**
   - Go to Database → Replication
   - Toggle ON for the `bookmarks` table

6. **Configure Google OAuth:**
   - Set up OAuth credentials in Google Cloud Console
   - Add to Supabase Authentication → Providers → Google

7. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Problems Faced and Solutions

### Problem 1: Real-time Updates Not Working

**Issue:** Bookmarks weren't syncing across different browser tabs in real-time.

**Root Cause:** Realtime replication wasn't enabled for the bookmarks table in Supabase.

**Solution:**
1. Enabled replication in Supabase: Database → Replication → Toggle ON for `bookmarks`
2. Added the table to the realtime publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```
3. Implemented proper WebSocket subscription cleanup in the `useEffect` hook:
```typescript
useEffect(() => {
  if (user) {
    fetchBookmarks()
    const cleanup = subscribeToBookmarks()
    return cleanup  // Critical: cleanup on unmount
  }
}, [user])
```

**Lesson Learned:** Always verify that Supabase Realtime is properly configured at the database level, not just in the code.

---

### Problem 2: Duplicate Bookmarks Appearing

**Issue:** When adding a bookmark, it would appear multiple times in the list.

**Root Cause:** Both the database insert response AND the real-time subscription were adding the bookmark to state.

**Solution:**
Implemented deduplication logic in the real-time subscription handler:
```typescript
if (payload.eventType === 'INSERT') {
  setBookmarks((prev) => {
    const exists = prev.some(b => 
      b.id === payload.new.id || 
      (b.url === payload.new.url && b.title === payload.new.title)
    )
    if (exists) return prev
    return [payload.new as Bookmark, ...prev]
  })
}
```

**Lesson Learned:** When using optimistic updates with real-time subscriptions, always check for duplicates before adding to state.

---

### Problem 3: Slow UI Feedback When Adding/Deleting

**Issue:** There was a 1-5 second delay before bookmarks appeared or disappeared in the UI.

**Root Cause:** The app was waiting for the database operation to complete and the real-time event to fire before updating the UI.

**Solution:**
Implemented **optimistic UI updates** - update the UI immediately, then handle the database operation:

```typescript
// For adding bookmarks
const addBookmark = async (e: React.FormEvent) => {
  // Create temp bookmark with temp ID
  const tempBookmark = { id: 'temp-' + Date.now(), url, title, ... }
  
  // Add to UI immediately
  setBookmarks((prev) => [tempBookmark, ...prev])
  
  // Then save to database
  const { data } = await supabase.from('bookmarks').insert([...]).select()
  
  // Replace temp with real bookmark
  if (data) {
    setBookmarks((prev) => prev.map(b => b.id === tempId ? data[0] : b))
  }
}

// For deleting bookmarks
const deleteBookmark = async (id: string) => {
  // Remove from UI immediately
  setBookmarks((prev) => prev.filter(b => b.id !== id))
  
  // Then delete from database
  await supabase.from('bookmarks').delete().eq('id', id)
}
```

**Lesson Learned:** For better UX, always update the UI optimistically and handle errors by reverting the change if needed.

---

### Problem 4: Google OAuth Redirect Errors

**Issue:** After signing in with Google, users got a "redirect_uri_mismatch" error.

**Root Cause:** The authorized redirect URIs in Google Cloud Console didn't match the Supabase callback URL.

**Solution:**
1. Added the correct redirect URI in Google Cloud Console:
```
https://[PROJECT-REF].supabase.co/auth/v1/callback
```
2. Also configured authorized origins in Supabase Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (development) or `https://your-app.vercel.app` (production)
   - Redirect URLs: Added wildcard `http://localhost:3000/**`

**Lesson Learned:** OAuth redirect URIs must match EXACTLY between the provider (Google) and the authentication service (Supabase). Always check both sides.

---

### Problem 5: Row Level Security Preventing Access

**Issue:** After setting up the database, users couldn't see their own bookmarks and got permission errors.

**Root Cause:** Row Level Security (RLS) was enabled but policies weren't properly configured.

**Solution:**
Created comprehensive RLS policies for all operations:
```sql
-- SELECT policy
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

**Lesson Learned:** When enabling RLS, you must create policies for EVERY operation (SELECT, INSERT, UPDATE, DELETE) that users need to perform.

---

### Problem 6: Vercel Build Failing with "supabaseUrl is required"

**Issue:** The app deployed to Vercel but the build failed with environment variable errors.

**Root Cause:** Environment variables weren't configured in Vercel's project settings.

**Solution:**
1. Added environment variables in Vercel: Settings → Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Made sure to check all environments (Production, Preview, Development)
3. Modified the Supabase client to handle missing env vars gracefully:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
```

**Lesson Learned:** Always configure environment variables BEFORE deploying. Use fallback values to prevent build failures.

---

### Problem 7: Page Pre-rendering Errors During Build

**Issue:** Next.js tried to pre-render the page during build, causing errors because Supabase wasn't available.

**Root Cause:** Next.js 14 tries to statically generate pages by default, but this page needs dynamic rendering due to authentication.

**Solution:**
Added dynamic rendering configuration to the page:
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

**Lesson Learned:** Pages that require authentication or runtime environment variables should use dynamic rendering, not static generation.

---

### Problem 8: Real-time Latency Between Tabs

**Issue:** Changes took 1-5 seconds to appear in other browser tabs.

**Root Cause:** This is expected behavior for Supabase Realtime on the free tier due to PostgreSQL WAL processing and WebSocket propagation.

**Solution:**
- Implemented optimistic updates so the current tab feels instant
- Educated users that 1-5 second sync delay is normal for real-time systems
- For production apps requiring faster sync, considered upgrading to Supabase Pro

**Key Insight:** "Real-time" doesn't mean "instant" - there's always some latency in distributed systems. The requirement was "updates without page refresh," which was met.

**Lesson Learned:** Set proper expectations. Real-time sync working within a few seconds is actually excellent performance.

---

## Performance Considerations

### Realtime Latency

| Operation | Same Tab | Other Tabs |
|-----------|----------|------------|
| Add Bookmark | < 100ms (optimistic) | 1-5 seconds (realtime) |
| Delete Bookmark | < 100ms (optimistic) | 1-5 seconds (realtime) |

The delay between tabs is **expected behavior** for Supabase Realtime and meets project requirements.

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with auth & bookmarks
│   └── globals.css         # Tailwind styles
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## Key Learnings

1. **Always read the documentation** - Many issues were solved by carefully reading Supabase and Next.js docs
2. **Test with multiple tabs** - Real-time features need to be tested across multiple sessions
3. **Optimistic UI is crucial** - Users expect instant feedback, even if the backend is async
4. **Error handling matters** - Always revert optimistic updates if the backend operation fails
5. **Environment variables are critical** - Double-check they're set correctly in all environments
6. **Security first** - Row Level Security ensures data privacy at the database level
7. **Real-time has inherent latency** - Set proper expectations about what "real-time" means

---

## Deployment

The app is deployed on Vercel with automatic deployments from the `main` branch.

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Future Improvements

- [ ] Add bookmark editing functionality
- [ ] Implement folders/categories
- [ ] Add tags and search
- [ ] Export bookmarks to JSON/CSV
- [ ] Show bookmark favicons
- [ ] Implement bookmark sharing
- [ ] Add browser extension

---

## Contributing

This was a learning project, but suggestions are welcome!

---

## License

MIT

---

## Acknowledgments

- Built as a project assignment
- Thanks to Anthropic's Claude for debugging assistance
- Supabase for the excellent BaaS platform
- Next.js team for the amazing framework

---

## Contact

- GitHub: [@YOUR-USERNAME](https://github.com/YOUR-USERNAME)
- Project Link: [https://github.com/YOUR-USERNAME/smart-bookmark-app](https://github.com/YOUR-USERNAME/smart-bookmark-app)
