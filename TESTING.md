# Testing Guide

## Test Scenarios

### 1. Authentication Tests

#### Test Google OAuth Login
1. Open the app
2. Click "Sign in with Google"
3. Select your Google account
4. Verify you're redirected back to the app
5. Check that your email appears in the header

**Expected:** Successfully logged in, email displayed

#### Test Sign Out
1. While logged in, click "Sign Out"
2. Verify you're redirected to login page
3. Try accessing bookmarks

**Expected:** Logged out, cannot see bookmarks

### 2. Bookmark CRUD Tests

#### Test Add Bookmark
1. Log in
2. Enter URL: `https://github.com`
3. Enter Title: `GitHub`
4. Click "Add Bookmark"
5. Verify bookmark appears in list

**Expected:** Bookmark added successfully, form cleared

#### Test Invalid URL
1. Enter Title: `Test`
2. Enter URL: `not-a-valid-url`
3. Click "Add Bookmark"

**Expected:** Browser validation prevents submission

#### Test Empty Fields
1. Leave URL empty
2. Click "Add Bookmark"

**Expected:** Browser validation prevents submission

#### Test Delete Bookmark
1. Create a bookmark
2. Click "Delete" button
3. Confirm bookmark is removed from list

**Expected:** Bookmark deleted successfully

### 3. Real-time Sync Tests

#### Test Cross-Tab Real-time Insert
1. Open app in Tab 1 and log in
2. Open app in Tab 2 (same browser, same account)
3. In Tab 1, add a new bookmark
4. Watch Tab 2

**Expected:** Bookmark appears instantly in Tab 2 without refresh

#### Test Cross-Tab Real-time Delete
1. Open app in Tab 1 and Tab 2 (logged in)
2. Ensure both tabs show the same bookmarks
3. In Tab 1, delete a bookmark
4. Watch Tab 2

**Expected:** Bookmark disappears instantly in Tab 2 without refresh

#### Test Different Browser Tabs
1. Log in on Chrome
2. Log in on Firefox (same account)
3. Add bookmark in Chrome
4. Check Firefox

**Expected:** Bookmark appears in Firefox after 1-2 seconds

### 4. Privacy Tests

#### Test User Isolation
1. Create Account A, add bookmarks
2. Sign out
3. Create Account B (different Google account)
4. Check bookmarks list

**Expected:** Account B should see no bookmarks (empty state)

#### Test Private Data
1. Log in as User A
2. Add bookmark with URL: `https://private-site.com`
3. Log in as User B (different account)
4. Try to access User A's bookmarks

**Expected:** User B cannot see User A's bookmarks

### 5. UI/UX Tests

#### Test Responsive Design
1. Open app on mobile device
2. Test all features
3. Verify layout adapts

**Expected:** All features work on mobile, UI is responsive

#### Test Long URLs
1. Add bookmark with very long URL (200+ chars)
2. Check display

**Expected:** URL should break correctly, not overflow container

#### Test Special Characters
1. Add bookmark with title: `Test & "Special" <Characters>`
2. Verify it displays correctly

**Expected:** Special characters rendered properly

### 6. Performance Tests

#### Test Load Time
1. Open app
2. Measure time to interactive

**Expected:** Page loads in under 3 seconds

#### Test With Many Bookmarks
1. Add 50+ bookmarks
2. Test scrolling
3. Test real-time updates

**Expected:** Smooth performance, no lag

### 7. Error Handling Tests

#### Test Network Offline
1. Log in
2. Disable internet connection
3. Try to add bookmark

**Expected:** Error message displayed

#### Test Invalid Supabase Credentials
1. Use wrong API keys
2. Try to use app

**Expected:** Clear error message

## Automated Testing Script

Create a simple test by opening browser console:

```javascript
// Test adding 10 bookmarks
for (let i = 0; i < 10; i++) {
  // Manually trigger add bookmark with:
  // URL: https://example.com/test-${i}
  // Title: Test Bookmark ${i}
}
```

## Test Checklist

Before marking as complete:

- [ ] Google OAuth login works
- [ ] Sign out works
- [ ] Add bookmark works
- [ ] Delete bookmark works
- [ ] Real-time sync works across tabs
- [ ] User data is private (tested with 2 accounts)
- [ ] Form validation works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Deployed to Vercel successfully
- [ ] Live URL accessible
- [ ] README is complete and accurate

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device info
5. Screenshots if applicable
6. Console errors (if any)

## Common Issues & Solutions

### Issue: Bookmarks not syncing
**Solution:** Check Realtime is enabled in Supabase → Database → Replication

### Issue: Login redirect fails
**Solution:** Verify redirect URLs in Supabase and Google Console match exactly

### Issue: Can see other users' bookmarks
**Solution:** Check RLS policies are enabled and correct

### Issue: TypeScript errors
**Solution:** Run `npm install` to ensure all types are installed
