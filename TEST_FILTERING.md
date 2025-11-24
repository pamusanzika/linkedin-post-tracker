# 🧪 Testing the Profile Filtering Feature

## Quick Start Testing

### 1. **Start the Servers**

```bash
# Terminal 1 - Backend
cd /Users/pamuda/Desktop/linkedin-tracker/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/pamuda/Desktop/linkedin-tracker/frontend
npm run dev
```

### 2. **Access the Dashboard**
Open your browser and navigate to: `http://localhost:5173/dashboard`

---

## 📋 Test Cases

### ✅ Test Case 1: Default View (All Posts)
**Steps:**
1. Navigate to dashboard
2. Observe the posts section

**Expected Results:**
- ✓ Header says "Latest Posts (Last 24 Hours)"
- ✓ No filter indicator is visible
- ✓ All posts from all profiles are displayed
- ✓ URL is `/dashboard` (no query params)

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 2: Apply Profile Filter
**Steps:**
1. Click on any profile card in the "Tracked Profiles" section
2. Observe URL, posts section, and profile card

**Expected Results:**
- ✓ URL changes to `/dashboard?profileId=<id>`
- ✓ Profile card gets blue border/highlight
- ✓ Filter indicator appears with text: "Showing posts by: [Profile Name]"
- ✓ Only posts from selected profile are shown
- ✓ If profile has no posts, message says "No posts found for [Profile Name]"

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 3: Switch Between Profiles
**Steps:**
1. Click profile A
2. Observe posts change
3. Click profile B
4. Observe posts change again

**Expected Results:**
- ✓ URL updates from `?profileId=A` to `?profileId=B`
- ✓ Profile A highlight removed, Profile B highlighted
- ✓ Posts switch from A's posts to B's posts
- ✓ Filter indicator updates with new profile name

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 4: Clear Filter
**Steps:**
1. Apply a profile filter (click any profile)
2. Click "Show All Posts" button in filter indicator

**Expected Results:**
- ✓ URL returns to `/dashboard` (query param removed)
- ✓ Filter indicator disappears
- ✓ Profile highlight removed
- ✓ All posts from all profiles shown again

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 5: URL Persistence on Refresh
**Steps:**
1. Click a profile to apply filter
2. Copy the URL (should be `/dashboard?profileId=<id>`)
3. Press browser refresh (F5 or Cmd+R)
4. Wait for page to reload

**Expected Results:**
- ✓ Filter remains active after refresh
- ✓ Same profile is highlighted
- ✓ Filter indicator still shows same profile name
- ✓ Same filtered posts are displayed
- ✓ URL still has `?profileId=<id>`

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 6: Direct URL Navigation
**Steps:**
1. Clear filter (show all posts)
2. Manually modify URL to include `?profileId=<valid-id>`
3. Press Enter

**Expected Results:**
- ✓ Filter is applied automatically
- ✓ Correct profile is highlighted
- ✓ Filter indicator appears
- ✓ Filtered posts are shown

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 7: Invalid Profile ID in URL
**Steps:**
1. Manually set URL to `?profileId=invalid-id-123`
2. Press Enter

**Expected Results:**
- ✓ No error is thrown
- ✓ No profile is highlighted
- ✓ All posts are shown (filter ignored for invalid ID)
- ✓ No filter indicator appears

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 8: Profile Link Click (No Filter Trigger)
**Steps:**
1. Click the LinkedIn profile URL link inside a profile card
2. Observe behavior

**Expected Results:**
- ✓ LinkedIn profile opens in new tab
- ✓ Filter is NOT applied
- ✓ Dashboard stays on current view
- ✓ No URL change in dashboard

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 9: Refresh Posts with Filter Active
**Steps:**
1. Apply a profile filter
2. Click "Refresh Posts" button
3. Wait for refresh to complete

**Expected Results:**
- ✓ Filter remains active during refresh
- ✓ New posts are fetched (but only for filtered profile)
- ✓ Filter indicator stays visible
- ✓ Profile highlight remains

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 10: Add New Profile While Filter Active
**Steps:**
1. Apply a profile filter
2. Add a new profile using the form
3. Observe behavior

**Expected Results:**
- ✓ New profile is added successfully
- ✓ Current filter remains active
- ✓ Posts still show filtered view
- ✓ Can click new profile to switch filter

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 11: Delete Filtered Profile
**Steps:**
1. Apply a filter for profile A
2. Delete profile A
3. Observe behavior

**Expected Results:**
- ✓ Profile is deleted
- ✓ Filter becomes invalid (profile doesn't exist)
- ✓ Either shows no posts OR auto-clears filter
- ✓ No crash or error

**Status:** [ ] Pass [ ] Fail

**Note:** Expected behavior could be improved to auto-clear filter when selected profile is deleted.

---

### ✅ Test Case 12: Mobile Responsiveness
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device emulation (mobile view)
3. Test filter functionality on mobile

**Expected Results:**
- ✓ Profile cards are clickable on mobile
- ✓ Filter indicator is readable
- ✓ "Show All Posts" button is accessible
- ✓ No layout issues

**Status:** [ ] Pass [ ] Fail

---

### ✅ Test Case 13: Browser Back/Forward
**Steps:**
1. Start with no filter
2. Click profile A (filter applied)
3. Click profile B (filter changed)
4. Click browser back button
5. Click browser forward button

**Expected Results:**
- ✓ Back button returns to profile A filter
- ✓ Forward button returns to profile B filter
- ✓ Each step updates posts and highlights correctly
- ✓ Filter indicator updates accordingly

**Status:** [ ] Pass [ ] Fail

---

## 🔍 Console Debugging

### Check for errors in browser console:
```javascript
// Should see no errors
// Should see logs like:
// "Failed to load profiles:" (only if error)
// "Failed to load posts:" (only if error)
```

### Check Network tab:
```
GET /api/posts/latest?hours=24
→ Without filter

GET /api/posts/latest?hours=24&profileId=abc123
→ With filter
```

### React DevTools:
```
Dashboard component:
- searchParams should have "profileId" when filtered
- selectedProfileId should match URL param
- selectedProfile should be the profile object
```

---

## 🐛 Common Issues & Solutions

### Issue: Filter not applying
**Solution:** Check that backend server is running and reachable

### Issue: Profile not highlighting
**Solution:** Verify CSS file is loaded and `.profile-card-selected` class exists

### Issue: Filter not persisting on refresh
**Solution:** Ensure React Router is properly configured with `BrowserRouter`

### Issue: "Show All Posts" button not working
**Solution:** Check that `handleClearFilter()` is called and `setSearchParams({})` is working

### Issue: Backend returns all posts even with profileId
**Solution:** Verify backend route is updated and TrackedProfile model is imported

---

## 📊 Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Default View | [ ] | |
| 2. Apply Filter | [ ] | |
| 3. Switch Profiles | [ ] | |
| 4. Clear Filter | [ ] | |
| 5. URL Persistence | [ ] | |
| 6. Direct URL Navigation | [ ] | |
| 7. Invalid Profile ID | [ ] | |
| 8. Profile Link Click | [ ] | |
| 9. Refresh with Filter | [ ] | |
| 10. Add Profile | [ ] | |
| 11. Delete Profile | [ ] | |
| 12. Mobile Responsive | [ ] | |
| 13. Browser Navigation | [ ] | |

**Overall Status:** [ ] All Pass [ ] Some Failures

---

## 🎬 Demo Flow

### Recommended demo sequence:
1. Show dashboard with all posts
2. Click a profile → observe filter applied
3. Show URL change in address bar
4. Click "Show All Posts" → observe filter cleared
5. Click another profile → observe filter switch
6. Refresh page → show filter persists
7. Click profile link → show it opens LinkedIn, doesn't filter

This demonstrates all key features in ~2 minutes.

---

## ✅ Acceptance Criteria

Feature is complete when:
- [x] Default view shows all posts
- [x] Clicking profile filters posts
- [x] Filter indicator displays selected profile
- [x] "Show All Posts" clears filter
- [x] URL includes `?profileId=` when filtered
- [x] Refresh maintains filter state
- [x] Profile highlights when selected
- [x] No console errors
- [x] Backend filters efficiently
- [x] Works on mobile devices

---

## 🚀 Next Steps

After testing passes:
1. Deploy backend with updated routes
2. Deploy frontend with new components
3. Update user documentation
4. Consider adding:
   - Pagination with filters
   - Additional filter types (date, keywords)
   - Filter combination (multiple profiles)
   - Save filter preferences

---

## 📝 Test Notes

**Date:** _____________  
**Tester:** _____________  
**Environment:** _____________  
**Additional Comments:**

_____________________________________________
_____________________________________________
_____________________________________________
