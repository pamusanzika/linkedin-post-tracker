const express = require('express');
const auth = require('../middleware/auth');
const TrackedProfile = require('../models/TrackedProfile');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * GET /api/profiles
 * Get all tracked profiles for the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const profiles = await TrackedProfile.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(profiles);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/profiles
 * Add a new tracked profile
 */
router.post('/', async (req, res, next) => {
  try {
    const { profileUrl, label } = req.body;

    // Validation
    if (!profileUrl) {
      return res.status(400).json({ message: 'Profile URL is required' });
    }

    // Validate LinkedIn URL format
    if (!profileUrl.startsWith('https://www.linkedin.com/')) {
      return res.status(400).json({
        message: 'Profile URL must start with https://www.linkedin.com/'
      });
    }

    // Check for duplicates
    const existingProfile = await TrackedProfile.findOne({
      userId: req.user._id,
      profileUrl
    });

    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already tracked' });
    }

    // Create profile
    const profile = new TrackedProfile({
      userId: req.user._id,
      profileUrl,
      label: label || ''
    });

    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/profiles/:id
 * Delete a tracked profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const profile = await TrackedProfile.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await TrackedProfile.deleteOne({ _id: req.params.id });

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;