const PostCard = ({ post, profileLabel }) => {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <h3>{post.authorFullName}</h3>
          <p className="author-title">{post.authorTitle}</p>
          {profileLabel && (
            <span className="profile-label">via {profileLabel}</span>
          )}
        </div>
        <div className="post-date">
          {formatDate(post.postedAtISO)}
        </div>
      </div>

      <div className="post-content">
        <p className="post-text">{post.text}</p>
        
        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="Post content" />
          </div>
        )}
        
        {post.images && post.images.length > 1 && (
          <div className="post-images-grid">
            {post.images.slice(1, 4).map((img, idx) => (
              <img key={idx} src={img} alt={`Post image ${idx + 2}`} />
            ))}
          </div>
        )}
      </div>

      <div className="post-engagement">
        <span className="engagement-item">
          👍 {post.numLikes.toLocaleString()} likes
        </span>
        <span className="engagement-item">
          💬 {post.numComments.toLocaleString()} comments
        </span>
        <span className="engagement-item">
          🔄 {post.numShares.toLocaleString()} shares
        </span>
      </div>

      <div className="post-footer">
        <a 
          href={post.postUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          Open on LinkedIn
        </a>
      </div>
    </div>
  );
};

export default PostCard;