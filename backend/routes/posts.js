const express = require('express');
const auth = require('../middleware/auth');
const TrackedProfile = require('../models/TrackedProfile');
const PostCache = require('../models/PostCache');
const { scrapeLinkedInPosts, fetchDatasetItems } = require('../services/apifyService');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/posts/refresh
 * Fetch latest posts from Apify for all tracked profiles
 */
router.post('/refresh', async (req, res, next) => {
  try {
    // Get all tracked profiles for this user
    const profiles = await TrackedProfile.find({ userId: req.user._id });

    if (profiles.length === 0) {
      return res.json({
        message: 'No profiles to refresh',
        profilesCount: 0,
        postsSaved: 0
      });
    }

    const profileUrls = profiles.map(p => p.profileUrl);
    console.log(`Refreshing posts for ${profileUrls.length} profiles`);

    // Build Apify actor input for the LinkedIn Profile Posts scraper
    const apifyOptions = req.body?.apifyOptions || {};

    const actorId = process.env.APIFY_LINKEDIN_PROFILE_POSTS_ACTOR_ID || process.env.APIFY_LINKEDIN_POST_SCRAPER_ACTOR_ID;

    const input = {
      targetUrls: profileUrls,
      scrapeReactions: typeof apifyOptions.scrapeReactions !== 'undefined'
        ? apifyOptions.scrapeReactions
        : (process.env.APIFY_SCRAPE_REACTIONS === 'true' || false),
      maxReactions: typeof apifyOptions.maxReactions !== 'undefined'
        ? apifyOptions.maxReactions
        : (process.env.APIFY_MAX_REACTIONS ? parseInt(process.env.APIFY_MAX_REACTIONS, 10) : 0),
      scrapeComments: typeof apifyOptions.scrapeComments !== 'undefined'
        ? apifyOptions.scrapeComments
        : (process.env.APIFY_SCRAPE_COMMENTS === 'true' || false),
      maxComments: typeof apifyOptions.maxComments !== 'undefined'
        ? apifyOptions.maxComments
        : (process.env.APIFY_MAX_COMMENTS ? parseInt(process.env.APIFY_MAX_COMMENTS, 10) : 0),
      maxPosts: typeof apifyOptions.maxPosts !== 'undefined'
        ? apifyOptions.maxPosts
        : (process.env.APIFY_MAX_POSTS ? parseInt(process.env.APIFY_MAX_POSTS, 10) : 0),
      includeQuotePosts: typeof apifyOptions.includeQuotePosts !== 'undefined'
        ? apifyOptions.includeQuotePosts
        : (typeof process.env.APIFY_INCLUDE_QUOTE_POSTS !== 'undefined' ? process.env.APIFY_INCLUDE_QUOTE_POSTS === 'true' : true),
      includeReposts: typeof apifyOptions.includeReposts !== 'undefined'
        ? apifyOptions.includeReposts
        : (typeof process.env.APIFY_INCLUDE_REPOSTS !== 'undefined' ? process.env.APIFY_INCLUDE_REPOSTS === 'true' : true)
    };

    // Scrape posts via Apify (pass custom actorId and input)
    const datasetId = await scrapeLinkedInPosts(profileUrls, { actorId, input });
    
    // Fetch dataset items
    const posts = await fetchDatasetItems(datasetId);
    console.log(`Fetched ${posts.length} posts from Apify`);

    let postsSaved = 0;

    // Helper function to normalize LinkedIn URLs for comparison
    const normalizeLinkedInUrl = (url) => {
      if (!url) return '';
      return url.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .replace(/\/posts$/, '')  // Remove /posts suffix for company pages
        .replace(/\?.*$/, '')
        .replace(/#.*$/, '');
    };

    // Helper to check if URL is a personal profile (not company/school)
    const isPersonalProfile = (url) => {
      if (!url) return false;
      const normalized = url.toLowerCase();
      return normalized.includes('/in/') && 
             !normalized.includes('/company/') && 
             !normalized.includes('/school/');
    };

    // Save posts to database
    for (const post of posts) {
      try {
        // Skip posts without URN (can't be uniquely identified)
        if (!post.urn && !post.id) {
          console.log(`⚠️  Skipping post without URN from ${post.authorFullName || 'Unknown'}`);
          continue;
        }

        // Determine which profile this post belongs to
        // Try multiple matching strategies
        const authorUrl = post.authorProfileUrl || post.author?.linkedinUrl || '';
        const authorPublicId = post.author?.publicIdentifier || post.author?.publicId || '';
        
        let matchingProfile = null;
        
        // Only try to match if it's a personal profile (not company/organization)
        if (isPersonalProfile(authorUrl)) {
          // Strategy 1: Direct URL match (normalized)
          if (authorUrl) {
            const normalizedAuthorUrl = normalizeLinkedInUrl(authorUrl);
            matchingProfile = profiles.find(p => 
              normalizeLinkedInUrl(p.profileUrl) === normalizedAuthorUrl
            );
          }
          
          // Strategy 2: Match by public identifier in URL
          if (!matchingProfile && authorPublicId) {
            matchingProfile = profiles.find(p => 
              p.profileUrl.toLowerCase().includes(`/in/${authorPublicId.toLowerCase()}`)
            );
          }
          
          // Strategy 3: Check if author URL contains any tracked profile URL
          if (!matchingProfile && authorUrl) {
            const normalizedAuthorUrl = normalizeLinkedInUrl(authorUrl);
            matchingProfile = profiles.find(p => 
              normalizedAuthorUrl.includes(normalizeLinkedInUrl(p.profileUrl)) ||
              normalizeLinkedInUrl(p.profileUrl).includes(normalizedAuthorUrl)
            );
          }
        }

        const profileUrl = matchingProfile?.profileUrl || profileUrls[0];
        
        // Debug logging for matching
        if (!matchingProfile && profileUrls.length > 1) {
          const authorType = !isPersonalProfile(authorUrl) ? ' (Company/Organization)' : '';
          console.log(`⚠️  Could not match post to specific profile. Author: ${post.authorFullName || 'Unknown'}${authorType}, AuthorURL: ${authorUrl || 'None'}. Using fallback: ${profileUrl}`);
        }

        // Map Apify data to our schema
        // Map post fields from either the legacy actor or the new "LinkedIn Profile Posts" actor
        // Helper: extract URL from image object or string
        const getImageUrl = (img) => {
          if (!img) return '';
          if (typeof img === 'string') return img;
          if (typeof img === 'object' && img.url) return img.url;
          return '';
        };
        
        // Helper: extract array of image URLs
        const getImageUrls = (imgs) => {
          if (!imgs) return [];
          if (!Array.isArray(imgs)) return [];
          return imgs.map(img => getImageUrl(img)).filter(url => url);
        };

        // Determine first image URL
        let firstImageUrl = '';
        if (post.image) {
          firstImageUrl = getImageUrl(post.image);
        } else if (post.postImages && post.postImages.length) {
          firstImageUrl = getImageUrl(post.postImages[0]);
        } else if (post.document?.coverPages?.[0]?.imageUrls?.[0]) {
          firstImageUrl = post.document.coverPages[0].imageUrls[0];
        }

        const urnValue = post.urn || post.id;
        
        const postData = {
          userId: req.user._id,
          profileUrl,
          urn: urnValue,
          postUrl: post.url || post.linkedinUrl || null,
          text: post.text || post.content || post.description || '',
          authorFullName: post.authorFullName || post.authorName || post.author?.name || '',
          authorTitle: post.authorTitle || post.authorHeadline || post.author?.info || '',
          authorProfileUrl: post.authorProfileUrl || post.author?.linkedinUrl || (post.author?.publicIdentifier ? `https://www.linkedin.com/in/${post.author.publicIdentifier}` : ''),
          image: firstImageUrl,
          images: getImageUrls(post.images || post.postImages || []),
          postedAtISO: post.postedAtISO || post.postedAt?.date || null,
          postedAtTimestamp: post.postedAtTimestamp || post.postedAt?.timestamp || null,
          timeSincePosted: post.timeSincePosted || post.postedAt?.postedAgoText || '',
          numLikes: post.numLikes || post.engagement?.likes || 0,
          numComments: post.numComments || (Array.isArray(post.comments) ? post.comments.length : post.engagement?.comments || 0) || 0,
          numShares: post.numShares || post.engagement?.shares || 0,
          raw: post
        };

        // Upsert (update if exists, insert if new)
        // Use $set to update only, prevents duplicate key errors
        await PostCache.findOneAndUpdate(
          { userId: req.user._id, urn: urnValue },
          { $set: postData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        postsSaved++;
      } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
          console.log(`ℹ️  Post ${post.urn || post.id} already exists, skipping...`);
        } else {
          console.error(`Error saving post ${post.urn || post.id}:`, error.message);
        }
        // Continue with next post
      }
    }

    res.json({
      message: 'Posts refreshed successfully',
      profilesCount: profiles.length,
      postsSaved
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/posts/debug-profile-match?profileId=123
 * Debug endpoint to check profile-post matching
 */
router.get('/debug-profile-match', async (req, res, next) => {
  try {
    const profileId = req.query.profileId;
    
    if (!profileId) {
      return res.status(400).json({ error: 'profileId is required' });
    }

    // Get the profile
    const profile = await TrackedProfile.findOne({
      _id: profileId,
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get all posts for this user
    const allPosts = await PostCache.find({ userId: req.user._id })
      .limit(50)
      .sort({ postedAtTimestamp: -1 });

    // Get posts that match this profile
    const matchingPosts = await PostCache.find({
      userId: req.user._id,
      profileUrl: profile.profileUrl
    }).limit(50);

    // Analyze the data
    const uniqueProfileUrls = [...new Set(allPosts.map(p => p.profileUrl))];
    
    res.json({
      profile: {
        id: profile._id,
        url: profile.profileUrl,
        label: profile.label
      },
      stats: {
        totalPosts: allPosts.length,
        matchingPosts: matchingPosts.length,
        uniqueProfileUrls: uniqueProfileUrls.length
      },
      uniqueProfileUrls,
      sampleMatchingPosts: matchingPosts.slice(0, 5).map(p => ({
        author: p.authorFullName,
        authorUrl: p.authorProfileUrl,
        profileUrl: p.profileUrl,
        text: p.text?.substring(0, 100)
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/posts/latest?hours=24&profileId=123
 * Get latest posts from the last N hours, optionally filtered by profile
 */
router.get('/latest', async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const profileId = req.query.profileId;
    
    // Calculate timestamp for N hours ago
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

    // Build query
    const query = {
      userId: req.user._id,
      postedAtTimestamp: { $gte: cutoffTime }
    };

    // Add profile filter if provided
    if (profileId) {
      const profile = await TrackedProfile.findOne({
        _id: profileId,
        userId: req.user._id
      });
      
      if (profile) {
        query.profileUrl = profile.profileUrl;
        console.log(`Filtering posts for profile: ${profile.label || profile.profileUrl}`);
      } else {
        console.log(`Profile not found for profileId: ${profileId}`);
      }
    }

    // Fetch posts
    const posts = await PostCache.find(query)
      .sort({ postedAtTimestamp: -1 })
      .limit(100); // Limit to prevent too many results

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;