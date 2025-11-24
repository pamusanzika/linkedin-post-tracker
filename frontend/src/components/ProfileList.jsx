import { useState } from 'react';

const ProfileList = ({ profiles, onAdd, onDelete, onProfileClick, selectedProfileId }) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onAdd(profileUrl, label);
      setProfileUrl('');
      setLabel('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await onDelete(id);
      } catch (err) {
        alert('Failed to delete profile');
      }
    }
  };

  return (
    <div className="profile-list-container">
      <div className="add-profile-form">
        <h3>Add LinkedIn Profile</h3>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional)"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Profile'}
          </button>
        </form>
      </div>

      <div className="profiles-list">
        <h3>Tracked Profiles ({profiles.length})</h3>
        
        {profiles.length === 0 ? (
          <p className="empty-message">No profiles tracked yet. Add one above!</p>
        ) : (
          <div className="profiles-grid">
            {profiles.map((profile) => (
              <div 
                key={profile._id} 
                className={`profile-card ${selectedProfileId === profile._id ? 'profile-card-selected' : ''}`}
              >
                <div 
                  className="profile-info"
                  onClick={() => onProfileClick && onProfileClick(profile._id)}
                  style={{ cursor: onProfileClick ? 'pointer' : 'default' }}
                >
                  <h4>{profile.label || 'Unlabeled'}</h4>
                  <a 
                    href={profile.profileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {profile.profileUrl}
                  </a>
                  <p className="profile-date">
                    Added: {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(profile._id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileList;