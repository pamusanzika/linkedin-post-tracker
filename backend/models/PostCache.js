const mongoose = require('mongoose');

const postCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileUrl: {
    type: String,
    required: true
  },
  urn: {
    type: String,
    required: true
  },
  postUrl: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  authorFullName: {
    type: String,
    default: ''
  },
  authorTitle: {
    type: String,
    default: ''
  },
  authorProfileUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  postedAtISO: {
    type: String,
    required: true
  },
  postedAtTimestamp: {
    type: Number,
    required: true
  },
  timeSincePosted: {
    type: String,
    default: ''
  },
  numLikes: {
    type: Number,
    default: 0
  },
  numComments: {
    type: Number,
    default: 0
  },
  numShares: {
    type: Number,
    default: 0
  },
  raw: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate posts per user
postCacheSchema.index({ userId: 1, urn: 1 }, { unique: true });
// Index for time-based queries
postCacheSchema.index({ userId: 1, postedAtTimestamp: -1 });
// Index for profile filtering
postCacheSchema.index({ userId: 1, profileUrl: 1, postedAtTimestamp: -1 });

module.exports = mongoose.model('PostCache', postCacheSchema);