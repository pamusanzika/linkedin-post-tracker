const axios = require('axios');

const APIFY_API_BASE = 'https://api.apify.com/v2';

/**
 * Start an Apify actor run to scrape LinkedIn posts
 * @param {string[]} profileUrls - Array of LinkedIn profile URLs
 * @returns {Promise<string>} - Dataset ID containing the results
 */
async function scrapeLinkedInPosts(profileUrls, { actorId = process.env.APIFY_LINKEDIN_POST_SCRAPER_ACTOR_ID, input = null } = {}) {
  const { APIFY_TOKEN } = process.env;

  if (!APIFY_TOKEN || !actorId) {
    throw new Error('Apify credentials or actor ID not configured');
  }

  try {
    // Build the input payload for the actor. If caller provides `input`, use it.
    // Otherwise use the legacy `{ urls: profileUrls }` shape.
    const payload = input ?? { urls: profileUrls };

    // Start the actor run
    const runResponse = await axios.post(
      `${APIFY_API_BASE}/acts/${actorId}/runs`,
      payload,
      {
        params: { token: APIFY_TOKEN },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const runId = runResponse.data.data.id;
    const defaultDatasetId = runResponse.data.data.defaultDatasetId;

    console.log(`Apify actor run started: ${runId}`);

    // Wait for the run to complete
    await waitForRunCompletion(runId);

    return defaultDatasetId;
  } catch (error) {
    console.error('Error starting Apify actor:', error.response?.data || error.message);
    throw new Error('Failed to scrape LinkedIn posts via Apify');
  }
}

/**
 * Wait for an Apify actor run to complete
 * @param {string} runId - The run ID to wait for
 */
async function waitForRunCompletion(runId, maxWaitTime = 300000, pollInterval = 5000) {
  const { APIFY_TOKEN } = process.env;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const statusResponse = await axios.get(
        `${APIFY_API_BASE}/actor-runs/${runId}`,
        { params: { token: APIFY_TOKEN } }
      );

      const status = statusResponse.data.data.status;
      console.log(`Apify run status: ${status}`);

      if (status === 'SUCCEEDED') {
        return;
      }

      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Apify run ${status.toLowerCase()}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      if (error.message.includes('run')) {
        throw error;
      }
      console.error('Error checking run status:', error.message);
      throw new Error('Failed to check Apify run status');
    }
  }

  throw new Error('Apify run timed out');
}

/**
 * Fetch dataset items from Apify
 * @param {string} datasetId - The dataset ID
 * @returns {Promise<Array>} - Array of post objects
 */
async function fetchDatasetItems(datasetId) {
  const { APIFY_TOKEN } = process.env;

  try {
    const response = await axios.get(
      `${APIFY_API_BASE}/datasets/${datasetId}/items`,
      {
        params: { token: APIFY_TOKEN },
        headers: { Accept: 'application/json' }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching dataset:', error.response?.data || error.message);
    throw new Error('Failed to fetch posts from Apify dataset');
  }
}

module.exports = {
  scrapeLinkedInPosts,
  fetchDatasetItems
};
