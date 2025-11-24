# 🔧 Developer Quick Reference - Profile Filtering

## 📍 Key Files Modified

### Frontend
```
frontend/src/
├── pages/Dashboard.jsx          ← Main filtering logic
├── components/ProfileList.jsx   ← Profile selection UI
├── utils/api.js                 ← API calls with profileId
└── App.css                      ← Filter UI styles
```

### Backend
```
backend/routes/
└── posts.js                     ← Server-side filtering
```

---

## 🎯 Quick Code Reference

### Dashboard State Management
```jsx
// Read profileId from URL
const [searchParams, setSearchParams] = useSearchParams();
const selectedProfileId = searchParams.get('profileId');

// Set filter
const handleProfileClick = (profileId) => {
  setSearchParams({ profileId });
};

// Clear filter
const handleClearFilter = () => {
  setSearchParams({});
};

// Auto-reload when filter changes
useEffect(() => {
  loadPosts();
}, [selectedProfileId]);
```

### API Call with Filter
```javascript
// Frontend
const data = await postsApi.getLatest(24, selectedProfileId);

// Backend
router.get('/latest', async (req, res, next) => {
  const profileId = req.query.profileId;
  
  if (profileId) {
    const profile = await TrackedProfile.findOne({
      _id: profileId,
      userId: req.user._id
    });
    if (profile) {
      query.profileUrl = profile.profileUrl;
    }
  }
  
  const posts = await PostCache.find(query);
  res.json(posts);
});
```

### Profile Card Click Handler
```jsx
<div 
  className={`profile-card ${selectedProfileId === profile._id ? 'profile-card-selected' : ''}`}
>
  <div 
    className="profile-info"
    onClick={() => onProfileClick(profile._id)}
    style={{ cursor: 'pointer' }}
  >
    {/* Profile content */}
  </div>
</div>
```

---

## 🎨 CSS Classes

```css
/* Filter indicator banner */
.filter-indicator { ... }

/* Selected profile highlight */
.profile-card-selected { 
  background-color: #e7f3ff;
  border: 2px solid #0a66c2;
}

/* Clear filter button */
.btn-link { ... }
```

---

## 🔗 URL Structure

```
No filter:    /dashboard
With filter:  /dashboard?profileId=507f1f77bcf86cd799439011
```

---

## 📊 Data Flow

```
User clicks profile
   ↓
handleProfileClick(profileId)
   ↓
setSearchParams({ profileId })
   ↓
URL updates: /dashboard?profileId=abc123
   ↓
selectedProfileId = 'abc123' (from searchParams)
   ↓
useEffect detects change
   ↓
loadPosts() called with selectedProfileId
   ↓
API: GET /api/posts/latest?hours=24&profileId=abc123
   ↓
Backend filters by profileUrl
   ↓
setPosts(filteredData)
   ↓
UI updates with filtered posts
```

---

## 🛠️ Adding New Filters

### Step 1: Add to URL params
```jsx
const dateRange = searchParams.get('dateRange');
```

### Step 2: Update API call
```javascript
const data = await postsApi.getLatest(24, selectedProfileId, dateRange);
```

### Step 3: Update backend
```javascript
if (req.query.dateRange) {
  // Add date filtering logic
}
```

### Step 4: Add UI controls
```jsx
<select onChange={(e) => setSearchParams({ ...searchParams, dateRange: e.target.value })}>
  <option value="24h">Last 24 Hours</option>
  <option value="7d">Last 7 Days</option>
</select>
```

---

## 🐛 Debugging Tips

### Check URL state
```javascript
console.log('Selected Profile ID:', selectedProfileId);
console.log('Search Params:', Object.fromEntries(searchParams));
```

### Check API request
```javascript
console.log('Fetching posts with profileId:', selectedProfileId);
```

### Check backend query
```javascript
console.log('Query:', query);
console.log('Profile found:', profile);
```

### Check filtered results
```javascript
console.log('Posts returned:', posts.length);
```

---

## 💡 Best Practices

✅ **DO:**
- Use URL params for persistent state
- Filter on server-side for performance
- Clear filter when profile is deleted
- Show empty state messages
- Add loading states

❌ **DON'T:**
- Filter large arrays client-side
- Store filter state in local component state
- Forget to handle edge cases (no posts, invalid ID)
- Block profile link clicks with filter trigger

---

## 🔄 State Management

```
URL (Single Source of Truth)
   ↓
searchParams (React Router)
   ↓
selectedProfileId (derived state)
   ↓
selectedProfile (computed from profiles array)
   ↓
posts (fetched with filter)
```

**Why URL-based?**
- Refresh-safe
- Shareable
- Browser history works
- No complex state management needed

---

## 🚀 Performance Notes

- **Server-side filtering:** ✅ Implemented (efficient)
- **Client-side filtering:** ❌ Not used (would be slow)
- **Dependency optimization:** ✅ useEffect only runs when needed
- **Memo/useMemo:** ⚠️ Not needed yet (but could add for large lists)

---

## 📦 Dependencies

```json
{
  "react-router-dom": "^6.30.2"  // For useSearchParams
}
```

---

## 🎓 Key Concepts

### useSearchParams Hook
```jsx
const [searchParams, setSearchParams] = useSearchParams();

// Read
searchParams.get('key')

// Set single param
setSearchParams({ key: 'value' })

// Set multiple params
setSearchParams({ key1: 'val1', key2: 'val2' })

// Clear all
setSearchParams({})
```

### MongoDB Filtering
```javascript
const query = {
  userId: req.user._id,
  profileUrl: specificUrl  // Added conditionally
};

const results = await PostCache.find(query);
```

---

## 🔐 Security Considerations

✅ **Implemented:**
- Auth middleware checks user ownership
- Backend validates profileId belongs to user
- Can't access other users' profiles

```javascript
const profile = await TrackedProfile.findOne({
  _id: profileId,
  userId: req.user._id  // ← Security check
});
```

---

## 📝 Future Enhancements

### Pagination with Filters
```javascript
const [page, setPage] = useState(1);
setSearchParams({ profileId, page });
```

### Multiple Profile Filter
```javascript
const profileIds = searchParams.get('profiles')?.split(',');
query.profileUrl = { $in: profileUrls };
```

### Save Filter Preferences
```javascript
localStorage.setItem('lastFilter', JSON.stringify({
  profileId: selectedProfileId
}));
```

### Advanced Filtering
```javascript
setSearchParams({
  profileId: 'abc123',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  minLikes: '100'
});
```

---

## 🔗 Related Documentation

- [Full Implementation Guide](./FILTERING_IMPLEMENTATION.md)
- [Testing Guide](./TEST_FILTERING.md)
- [React Router Docs](https://reactrouter.com/en/main/hooks/use-search-params)

---

## ⚡ Quick Commands

### Start Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Check Implementation
```bash
# View modified files
git diff frontend/src/pages/Dashboard.jsx
git diff backend/routes/posts.js
```

### Test API Endpoint
```bash
# All posts
curl http://localhost:5000/api/posts/latest?hours=24 -H "Authorization: Bearer YOUR_TOKEN"

# Filtered posts
curl http://localhost:5000/api/posts/latest?hours=24&profileId=abc123 -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Support

For questions or issues:
1. Check console for errors
2. Verify URL structure
3. Test API endpoint directly
4. Review [FILTERING_IMPLEMENTATION.md](./FILTERING_IMPLEMENTATION.md)

---

**Last Updated:** November 24, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
