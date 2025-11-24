const mongoose = require('mongoose');

const trackedProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileUrl: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
trackedProfileSchema.index({ userId: 1 });
trackedProfileSchema.index({ userId: 1, profileUrl: 1 });

module.exports = mongoose.model('TrackedProfile', trackedProfileSchema);