import Challenge from '../models/Challenge.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

/**
 * Calculate the start and end of the current week (Monday 00:00 to Sunday 23:59:59)
 */
export const getWeekBounds = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);

  const weekStart = new Date(d.setDate(diffToMonday));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

/**
 * Retrieve active challenge for user, performing lazy check on expiration
 */
export const getCurrentChallengeForUser = async (userId) => {
  const challenge = await Challenge.findOne({
    user: userId,
    status: 'active'
  }).populate('activities');

  if (!challenge) return null;

  const now = new Date();
  if (now > challenge.weekEnd) {
    // Challenge expired; finalize status
    challenge.status = challenge.completedCount >= challenge.goal ? 'completed' : 'failed';
    await challenge.save();
    return null;
  }

  return challenge;
};

/**
 * Create a new weekly challenge either with selected activity IDs or auto-generated from saved items
 */
export const createChallengeForUser = async (userId, { activityIds = [], auto = false, count = 3 } = {}) => {
  // Check if an active challenge already exists
  const existing = await getCurrentChallengeForUser(userId);
  if (existing) {
    const error = new Error('You already have an active challenge for this week.');
    error.statusCode = 400;
    throw error;
  }

  const { weekStart, weekEnd } = getWeekBounds();
  let selectedActivityIds = [...activityIds];

  if (auto || !selectedActivityIds.length) {
    const targetCount = count || 3;
    const savedActivities = await Activity.find({
      user: userId,
      status: 'saved'
    }).limit(targetCount);

    if (savedActivities.length < targetCount) {
      const error = new Error(
        `You need at least ${targetCount} saved activities in your backlog to auto-generate a challenge. You currently have ${savedActivities.length}.`
      );
      error.statusCode = 400;
      throw error;
    }

    selectedActivityIds = savedActivities.map((a) => a._id);
  }

  // Count if any are already completed
  const populated = await Activity.find({ _id: { $in: selectedActivityIds }, user: userId });
  const completedCount = populated.filter((a) => a.status === 'done').length;
  const goal = selectedActivityIds.length;
  const status = completedCount >= goal ? 'completed' : 'active';

  const newChallenge = await Challenge.create({
    user: userId,
    weekStart,
    weekEnd,
    activities: selectedActivityIds,
    goal,
    completedCount,
    status
  });

  return newChallenge.populate('activities');
};

/**
 * Re-calculate progress on active challenge when an activity is updated
 */
export const syncChallengeProgress = async (userId) => {
  try {
    const challenge = await Challenge.findOne({ user: userId, status: 'active' });
    if (!challenge) return null;

    const activities = await Activity.find({
      _id: { $in: challenge.activities }
    });

    const completed = activities.filter((a) => a.status === 'done').length;
    challenge.completedCount = completed;

    if (challenge.completedCount >= challenge.goal) {
      challenge.status = 'completed';
      // Award bonus XP (+50 XP for completing a weekly challenge)
      await User.findByIdAndUpdate(userId, {
        $inc: { xp: 50 },
        $addToSet: { badges: 'Challenge Champion' }
      });
    }

    await challenge.save();
    return challenge;
  } catch (error) {
    // Gracefully avoid breaking activity update if challenge sync encounters db error in test/isolated env
    console.warn('[Challenge Sync Error]', error.message);
    return null;
  }
};
