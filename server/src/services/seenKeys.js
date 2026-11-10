import mongoose from 'mongoose';
import Activity from '../models/Activity.js';

/**
 * Which catalogue quests a user has already saved, finished or set aside.
 *
 * Suggestions need this to skip repeats, but they must never wait on the database for it. So:
 *  - results are cached per user and kept current when quests are saved or deleted, so most
 *    suggestions cost no query at all;
 *  - when a lookup is needed it is time-limited, and skipped entirely while MongoDB is disconnected;
 *  - if it can't finish in time we use the last known list (or none): worst case the user is shown a
 *    quest they already handled, and saving it again is rejected as a duplicate.
 */
const CACHE_TTL_MS = 60 * 1000;
const LOOKUP_TIMEOUT_MS = 1500;
const CONNECTED = 1;

const cache = new Map(); // userId -> { keys: Set<string>, at: number }

export const getUserSeenKeys = async (userId) => {
  if (!userId) return new Set();
  const id = String(userId);
  const cached = cache.get(id);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.keys;

  const fallback = cached?.keys ?? new Set();
  if (mongoose.connection.readyState !== CONNECTED) return fallback;

  // Keep running after the time limit so a slow answer still warms the cache for next time.
  const lookup = Activity.find({ user: id, apiKey: { $ne: null } }, 'apiKey')
    .lean()
    .then((docs) => {
      const keys = new Set(docs.map((doc) => doc.apiKey));
      cache.set(id, { keys, at: Date.now() });
      return keys;
    })
    .catch(() => null);

  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), LOOKUP_TIMEOUT_MS);
  });
  const keys = await Promise.race([lookup, timeout]);
  clearTimeout(timer);
  return keys ?? fallback;
};

/** A quest was just saved: remember it without another query. */
export const markSeen = (userId, apiKey) => {
  if (!userId || !apiKey) return;
  cache.get(String(userId))?.keys.add(apiKey);
};

/** A quest was removed (it may be offered again): drop the cached list so it is rebuilt. */
export const forgetSeenKeys = (userId) => {
  if (userId) cache.delete(String(userId));
};

/** Forget everything (used by tests). */
export const clearSeenKeysCache = () => cache.clear();
