# Troubleshooting Guide

Common issues and their solutions.

## Authentication Issues

### Error: "Invalid login credentials"

**Symptoms:** Can't sign in with Google

**Solutions:**
1. Check Google OAuth is enabled in Supabase (Authentication → Providers)
2. Verify Client ID and Secret are correct in Supabase
3. Ensure Google+ API is enabled in Google Cloud Console
4. Check redirect URIs match exactly:
   - Supabase: `https://your-project.supabase.co/auth/v1/callback`
   - Google Console: Same URL in "Authorized redirect URIs"

### Error: "Redirect URL mismatch"

**Symptoms:** After Google login, get error about redirect URL

**Solutions:**
1. In Supabase, go to Authentication → URL Configuration
2. Add your app URL to "Site URL"
3. Add your app URL with `/**` to "Redirect URLs"
4. For local development, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
5. For production, add:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Error: "User not found" after login

**Symptoms:** Login appears to work but user is null

**Solutions:**
1. Check browser console for errors
2. Verify Supabase credentials in `.env.local`
3. Clear browser cookies and cache
4. Try incognito/private browsing mode
5. Check Supabase dashboard → Authentication → Users to see if user was created

## Database Issues

### Error: "relation 'bookmarks' does not exist"

**Symptoms:** Can't add or view bookmarks

**Solutions:**
1. Run the SQL from `supabase-setup.sql` in Supabase SQL Editor
2. Check Database → Tables to verify "bookmarks" table exists
3. Verify table has correct columns: id, user_id, url, title, created_at

### Error: "permission denied for table bookmarks"

**Symptoms:** Can't insert or view bookmarks

**Solutions:**
1. Check Row Level Security is enabled
2. Verify all three RLS policies exist:
   - "Users can view own bookmarks"
   - "Users can insert own bookmarks"
   - "Users can delete own bookmarks"
3. Re-run the policy creation SQL from `supabase-setup.sql`

### Bookmarks from other users are visible

**Symptoms:** Privacy issue - seeing other users' data

**Solutions:**
1. This is a CRITICAL security issue
2. Check RLS is enabled: `ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;`
3. Verify policies check `auth.uid() = user_id`
4. Test with two different Google accounts
5. Check Supabase logs for policy violations

## Real-time Issues

### Bookmarks don't sync across tabs

**Symptoms:** Adding bookmark in one tab doesn't show in another

**Solutions:**
1. Enable Realtime in Supabase:
   - Go to Database → Replication
   - Find "bookmarks" table
   - Toggle ON
2. Check browser console for subscription errors
3. Verify you're using the same user account in both tabs
4. Try refreshing both tabs
5. Check Network tab for WebSocket connection

### Error: "Realtime connection failed"

**Symptoms:** WebSocket connection errors in console

**Solutions:**
1. Verify Supabase project is running (check dashboard)
2. Check your internet connection
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
4. Try disabling browser extensions (ad blockers can block WebSockets)
5. Check if corporate firewall blocks WebSocket connections

## Deployment Issues

### Vercel build fails

**Symptoms:** Build errors on Vercel

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Make sure package.json has all dependencies
4. Try building locally: `npm run build`
5. Check for TypeScript errors: `npm run lint`

### App works locally but not on Vercel

**Symptoms:** Works on localhost:3000 but not on production URL

**Solutions:**
1. Check environment variables in Vercel Settings
2. Update Supabase redirect URLs to include Vercel URL
3. Clear Vercel cache and redeploy
4. Check Vercel function logs for runtime errors
5. Verify you're using the production Vercel URL, not preview URL

### 404 Error after deployment

**Symptoms:** All pages return 404

**Solutions:**
1. Check Vercel deployment status (should be "Ready")
2. Verify build completed successfully
3. Check Vercel project settings → General → Framework Preset is "Next.js"
4. Try redeploying from Vercel dashboard
5. Check vercel.json configuration

## Development Issues

### Error: "Module not found"

**Symptoms:** Import errors, missing dependencies

**Solutions:**
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```
3. Verify all dependencies in package.json
4. Check Node.js version (need 18+)

### TypeScript errors

**Symptoms:** Type errors in IDE or build

**Solutions:**
1. Run `npm install` to get latest type definitions
2. Check tsconfig.json is correct
3. Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
4. Verify @types packages are installed

### Hot reload not working

**Symptoms:** Changes don't appear without manual refresh

**Solutions:**
1. Check if `npm run dev` is running
2. Restart dev server
3. Clear browser cache
4. Check for errors in terminal
5. Verify files are being saved

## Performance Issues

### App is slow to load

**Symptoms:** Long load times, poor performance

**Solutions:**
1. Check Supabase dashboard for query performance
2. Verify database indexes exist (check `supabase-setup.sql`)
3. Limit number of bookmarks loaded (add pagination)
4. Check browser DevTools → Performance tab
5. Optimize images and assets

### Real-time updates are delayed

**Symptoms:** Bookmarks take several seconds to sync

**Solutions:**
1. This is normal for 1-2 second delay
2. Check internet connection speed
3. Verify Supabase region is close to your location
4. Check browser console for reconnection attempts
5. Consider upgrading Supabase plan for better performance

## Browser-Specific Issues

### Works in Chrome but not Firefox/Safari

**Symptoms:** Browser compatibility issues

**Solutions:**
1. Check browser console for specific errors
2. Verify browser supports modern JavaScript features
3. Clear browser cache and cookies
4. Try incognito/private mode
5. Update browser to latest version

### Cookies not working

**Symptoms:** Can't stay logged in, session issues

**Solutions:**
1. Check browser cookie settings (need to allow cookies)
2. For localhost, some browsers block third-party cookies
3. Use 127.0.0.1 instead of localhost
4. Check browser extensions aren't blocking cookies
5. Verify Supabase session is being created

## Data Issues

### Bookmarks disappear after refresh

**Symptoms:** Data doesn't persist

**Solutions:**
1. Check if you're still logged in (session might have expired)
2. Verify bookmarks were actually saved (check Supabase dashboard → Table Editor)
3. Check for JavaScript errors preventing data load
4. Verify RLS policies allow SELECT
5. Check network tab for failed API calls

### Can't delete bookmarks

**Symptoms:** Delete button doesn't work

**Solutions:**
1. Check browser console for errors
2. Verify RLS policy allows DELETE
3. Check user_id matches between user and bookmark
4. Verify bookmark ID is correct
5. Check Supabase logs for delete operation

## Environment Variable Issues

### Error: "supabaseUrl and supabaseKey are required"

**Symptoms:** Supabase client initialization fails

**Solutions:**
1. Verify `.env.local` file exists
2. Check variable names match exactly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart dev server after adding env vars
4. For Vercel, add in project settings → Environment Variables
5. Make sure env vars have `NEXT_PUBLIC_` prefix

## Getting More Help

If none of these solutions work:

1. **Check Supabase Logs**
   - Go to Supabase dashboard → Logs
   - Look for error messages

2. **Check Vercel Logs**
   - Go to Vercel dashboard → Deployments
   - Click on deployment → View Function Logs

3. **Browser DevTools**
   - Console tab: JavaScript errors
   - Network tab: Failed API calls
   - Application tab: Storage, cookies

4. **Create GitHub Issue**
   Include:
   - Exact error message
   - Steps to reproduce
   - Browser/OS info
   - Screenshots
   - Console errors

5. **Supabase Discord**
   - Join: https://discord.supabase.com
   - Ask in #help channel

6. **Stack Overflow**
   - Tag: [supabase], [next.js], [vercel]
   - Include error details and code

## Preventive Measures

To avoid issues:

- ✅ Always test locally before deploying
- ✅ Use version control (git)
- ✅ Keep dependencies updated
- ✅ Monitor Supabase dashboard
- ✅ Check Vercel deployment logs
- ✅ Test with multiple user accounts
- ✅ Test in different browsers
- ✅ Enable error tracking (Sentry, etc.)
- ✅ Backup your database regularly
- ✅ Document any custom changes

## Debug Checklist

When something breaks, check in this order:

1. [ ] Browser console for errors
2. [ ] Network tab for failed requests
3. [ ] Are you logged in?
4. [ ] Environment variables set correctly?
5. [ ] Supabase project is running?
6. [ ] RLS policies are correct?
7. [ ] Database tables exist?
8. [ ] Realtime is enabled?
9. [ ] Internet connection working?
10. [ ] Try in incognito mode
11. [ ] Try different browser
12. [ ] Check Supabase logs
13. [ ] Check Vercel logs
14. [ ] Restart dev server
15. [ ] Clear cache and cookies
