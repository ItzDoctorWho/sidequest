import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', description: 'Completed your first activity', icon: 'Footprints' },
  { id: 'explorer', name: 'Explorer', description: 'Completed activities in 3 different categories', icon: 'Compass' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Completed 5 social activities', icon: 'Users' },
  { id: 'streak_3', name: 'On a Roll', description: 'Maintained a 3-day active streak', icon: 'Flame' },
  { id: 'streak_7', name: 'Unstoppable', description: 'Maintained a 7-day active streak', icon: 'Zap' },
  { id: 'challenge_champion', name: 'Challenge Champion', description: 'Completed a weekly challenge', icon: 'Trophy' }
];

/**
 * Calculate user stats, category distributions, streaks and badges
 */
export const getUserStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const activities = await Activity.find({ user: userId });
  const completed = activities.filter((a) => a.status === 'done');

  // 1. Completed by Category
  const byTypeMap = {};
  completed.forEach((act) => {
    byTypeMap[act.type] = (byTypeMap[act.type] || 0) + 1;
  });
  const byType = Object.keys(byTypeMap).map((type) => ({
    type,
    count: byTypeMap[type]
  }));

  // 2. Completed over the last 7 days (day by day)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];

    const count = completed.filter((a) => {
      if (!a.completedAt) return false;
      return a.completedAt.toISOString().split('T')[0] === dateStr;
    }).length;

    last7Days.push({ day: dayLabel, date: dateStr, count });
  }

  // 3. Dynamic badge eligibility calculation
  const eligibleBadges = new Set(user.badges || []);

  if (completed.length >= 1) {
    eligibleBadges.add('First Step');
  }
  if (Object.keys(byTypeMap).length >= 3) {
    eligibleBadges.add('Explorer');
  }
  if ((byTypeMap.social || 0) >= 5) {
    eligibleBadges.add('Social Butterfly');
  }
  if (user.streak >= 3) {
    eligibleBadges.add('On a Roll');
  }
  if (user.streak >= 7) {
    eligibleBadges.add('Unstoppable');
  }

  // Persist any newly awarded badges
  if (eligibleBadges.size !== (user.badges?.length || 0)) {
    user.badges = Array.from(eligibleBadges);
    await user.save();
  }

  return {
    xp: user.xp || 0,
    streak: user.streak || 0,
    totalSaved: activities.filter((a) => a.status === 'saved').length,
    totalCompleted: completed.length,
    totalSkipped: activities.filter((a) => a.status === 'skipped').length,
    byType,
    last7Days,
    badges: user.badges,
    allBadgeDefinitions: BADGE_DEFINITIONS
  };
};

