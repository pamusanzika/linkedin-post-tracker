import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profiles as profilesApi, posts as postsApi } from '../utils/api';
import ProfileList from '../components/ProfileList';
import PostCard from '../components/PostCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  
  // Get selected profile ID from URL
  const selectedProfileId = searchParams.get('profileId');

  useEffect(() => {
    loadProfiles();
    loadPosts();
  }, [selectedProfileId]); // Reload posts when filter changes

  const loadProfiles = async () => {
    try {
      const data = await profilesApi.getAll();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsApi.getLatest(24, selectedProfileId);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = async (profileUrl, label) => {
    await profilesApi.create(profileUrl, label);
    await loadProfiles();
  };

  const handleDeleteProfile = async (id) => {
    await profilesApi.delete(id);
    await loadProfiles();
  };

  const handleRefreshPosts = async () => {
    try {
      setRefreshing(true);
      setMessage('');
      const result = await postsApi.refresh();
      setMessage(`Refreshed! ${result.postsSaved} posts saved from ${result.profilesCount} profiles.`);
      await loadPosts();
    } catch (err) {
      setMessage('Failed to refresh posts: ' + (err.response?.data?.message || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  const getProfileLabel = (profileUrl) => {
    const profile = profiles.find(p => p.profileUrl === profileUrl);
    return profile?.label || profileUrl;
  };

  // Handle profile selection for filtering
  const handleProfileClick = (profileId) => {
    setSearchParams({ profileId });
  };

  // Clear filter and show all posts
  const handleClearFilter = () => {
    setSearchParams({});
  };

  // Get currently selected profile
  const selectedProfile = selectedProfileId 
    ? profiles.find(p => p._id === selectedProfileId)
    : null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LinkedIn Post Tracker</h1>
        <div className="header-actions">
          <span>Welcome, {user?.email}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="profiles-section">
          <ProfileList
            profiles={profiles}
            onAdd={handleAddProfile}
            onDelete={handleDeleteProfile}
            onProfileClick={handleProfileClick}
            selectedProfileId={selectedProfileId}
          />
        </section>

        <section className="posts-section">
          <div className="posts-header">
            <h2>Latest Posts (Last 24 Hours)</h2>
            <button
              onClick={handleRefreshPosts}
              disabled={refreshing || profiles.length === 0}
              className="btn btn-primary"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Posts'}
            </button>
          </div>

          {/* Filter Indicator */}
          {selectedProfile && (
            <div className="filter-indicator">
              <span className="filter-label">
                Showing posts by: <strong>{selectedProfile.label || selectedProfile.profileUrl}</strong>
              </span>
              <button onClick={handleClearFilter} className="btn btn-link">
                Show All Posts
              </button>
            </div>
          )}

          {message && <div className="info-message">{message}</div>}

          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="empty-message">
              {selectedProfile 
                ? `No posts found for ${selectedProfile.label || 'this profile'}. Try selecting a different profile or click "Show All Posts".`
                : `No posts found. ${profiles.length === 0 ? 'Add profiles above and ' : ''}Click "Refresh Posts" to fetch latest posts from LinkedIn.`
              }
            </p>
          ) : (
            <div className="posts-feed">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  profileLabel={getProfileLabel(post.profileUrl)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;