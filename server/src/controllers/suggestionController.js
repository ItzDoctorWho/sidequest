import {
  findActivities,
  formatPriceLabel,
  formatAvailabilityLabel,
  matchesMaxDuration
} from '../services/boredApi.js';
import { getUserSeenKeys } from '../services/seenKeys.js';

// Attach formatted helper labels
const enrichActivity = (activity) => ({
  ...activity,
  priceLabel: formatPriceLabel(activity.price),
  availabilityLabel: formatAvailabilityLabel(activity.availability)
});

/**
 * Activities that match the request and that this user hasn't handled yet.
 * Both the catalogue and the user's history are served from memory in the common case, and neither
 * can stall the request: see services/boredApi.js and services/seenKeys.js.
 */
const getAvailableActivities = async (req) => {
  const { type, participants, maxDuration } = req.query;
  const [seenKeys, activities] = await Promise.all([
    getUserSeenKeys(req.user?.id),
    findActivities({ type, participants: participants ? Number(participants) : undefined })
  ]);
  return activities.filter((act) => !seenKeys.has(act.key) && matchesMaxDuration(act, maxDuration));
};

/**
 * GET /api/suggestions/random?type=&participants=&maxDuration=
 */
export const getRandomSuggestion = async (req, res, next) => {
  try {
    const { type, participants, maxDuration } = req.query;
    const hasFilter = Boolean(type || participants || maxDuration);
    const available = await getAvailableActivities(req);

    if (!available.length) {
      return res.status(404).json({
        message: hasFilter
          ? 'No activities found matching your filters. Try adjusting your preferences!'
          : "You've been through every quest we have. Add your own, or check back soon!"
      });
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    res.status(200).json(enrichActivity(chosen));
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: 'No activities found matching your criteria.'
      });
    }
    next(error);
  }
};

/**
 * GET /api/suggestions/browse?type=&participants=&maxDuration=
 */
export const browseSuggestions = async (req, res, next) => {
  try {
    const available = await getAvailableActivities(req);
    res.status(200).json(available.map(enrichActivity));
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(200).json([]);
    }
    next(error);
  }
};
