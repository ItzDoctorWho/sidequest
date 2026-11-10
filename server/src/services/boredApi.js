import axios from 'axios';

const BORED_API_BASE_URL = 'https://bored-api.appbrewery.com';

export const VALID_TYPES = [
  'education',
  'recreational',
  'social',
  'charity',
  'cooking',
  'relaxation',
  'busywork'
];

export const VALID_PARTICIPANTS = [1, 2, 3, 4, 5, 6, 8];

// Ordered shortest to longest. `maxDuration` keeps activities up to and including that length.
export const DURATION_ORDER = ['minutes', 'hours', 'days', 'weeks'];
export const VALID_MAX_DURATIONS = ['minutes', 'hours'];

export const matchesMaxDuration = (activity, maxDuration) => {
  if (!maxDuration) return true;
  const rank = DURATION_ORDER.indexOf(String(activity.duration || '').toLowerCase());
  if (rank === -1) return false;
  return rank <= DURATION_ORDER.indexOf(maxDuration);
};

/**
 * Format activity price/availability into user-friendly labels
 */
export const formatPriceLabel = (price) => {
  if (price === 0 || price === undefined || price === null) return 'Free';
  if (price <= 0.3) return 'Cheap';
  if (price <= 0.6) return 'Moderate';
  return 'Pricey';
};

export const formatAvailabilityLabel = (availability) => {
  if (availability === undefined || availability === null) return 'Unknown';
  if (availability <= 0.3) return 'Rare';
  if (availability <= 0.7) return 'Moderate';
  return 'Common';
};

// The upstream API is intermittently slow (about 2s per call, with spikes of 10s+).
// A short timeout plus one retry beats one long wait.
const REQUEST_TIMEOUT_MS = 5000;
// The catalogue is one larger response that is only fetched on a cold start or a refresh.
const CATALOGUE_TIMEOUT_MS = 10000;
const MAX_ATTEMPTS = 2;

const isRetryable = (error) =>
  !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';

const getUpstream = async (path, params, timeout = REQUEST_TIMEOUT_MS) => {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await axios.get(`${BORED_API_BASE_URL}${path}`, { params, timeout });
    } catch (error) {
      lastError = error;
      // 4xx (e.g. 404 "no match") is a real answer, not an outage: let callers handle it.
      if (!isRetryable(error)) throw error;
    }
  }
  const unavailable = new Error(
    'The activity service is slow or unavailable right now. Please try again in a moment.'
  );
  unavailable.statusCode = 503;
  unavailable.cause = lastError;
  throw unavailable;
};

/**
 * The whole activity catalogue (about 200 entries) lives in memory.
 *
 * Asking the upstream API for each suggestion cost 2s or more per card. One `/filter` call with no
 * parameters returns everything, so random picks and filters are done locally and take microseconds.
 * The catalogue is refreshed in the background once it gets old; until the refresh lands (or if it
 * fails) the existing copy keeps answering, so an upstream outage never reaches the user.
 */
const CATALOGUE_TTL_MS = 6 * 60 * 60 * 1000;
let catalogue = { items: [], fetchedAt: 0 };
let inflight = null;

/** Load the catalogue. Concurrent callers share one upstream request. */
const refreshCatalogue = () => {
  if (!inflight) {
    inflight = getUpstream('/filter', undefined, CATALOGUE_TIMEOUT_MS)
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        // Never replace a good copy with an empty answer.
        if (items.length) catalogue = { items, fetchedAt: Date.now() };
        return catalogue.items;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

export const getCatalogue = async () => {
  if (catalogue.items.length) {
    if (Date.now() - catalogue.fetchedAt > CATALOGUE_TTL_MS) {
      refreshCatalogue().catch(() => {}); // stale-while-revalidate: answer now, refresh behind the scenes
    }
    return catalogue.items;
  }
  return refreshCatalogue(); // cold start: the only time a request waits on the upstream
};

/** Activities matching the type / group size filters (same rules the upstream `/filter` applied). */
export const findActivities = async ({ type, participants } = {}) => {
  const items = await getCatalogue();
  return items.filter(
    (act) => (!type || act.type === type) && (!participants || act.participants === Number(participants))
  );
};

/** Fire-and-forget: load the catalogue at startup so the first visitor doesn't wait. Never throws. */
export const warmCatalogue = async () => {
  try {
    await getCatalogue();
  } catch {
    // The first real request will try again.
  }
};

/** Forget everything (used by tests). */
export const clearSuggestionCache = () => {
  catalogue = { items: [], fetchedAt: 0 };
  inflight = null;
};
