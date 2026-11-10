import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { syncChallengeProgress } from '../services/challengeService.js';
import { markSeen, forgetSeenKeys } from '../services/seenKeys.js';

/**
 * GET /api/activities?status=&type=
 */
export const getActivities = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (type) query.type = type;

    const activities = await Activity.find(query).sort({ updatedAt: -1 });
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/activities
 * Save a suggestion snapshot OR create custom activity
 */
export const createActivity = async (req, res, next) => {
  try {
    const {
      apiKey,
      activity,
      type,
      participants,
      price,
      availability,
      accessibility,
      duration,
      kidFriendly,
      link,
      status = 'saved',
      isCustom = false,
      notes = ''
    } = req.body;

    // Check for duplicate saved API activity
    if (apiKey) {
      const existing = await Activity.findOne({ user: req.user.id, apiKey });
      if (existing) {
        return res.status(400).json({
          message: 'You have already added or saved this activity.'
        });
      }
    }

    const newActivity = await Activity.create({
      user: req.user.id,
      apiKey: apiKey || null,
      activity,
      type: type || 'recreational',
      participants: Number(participants) || 1,
      price: price !== undefined ? Number(price) : 0,
      availability: availability !== undefined ? Number(availability) : 0.5,
      accessibility: accessibility || 'Few to no challenges',
      duration: duration || 'hours',
      kidFriendly: kidFriendly !== undefined ? Boolean(kidFriendly) : true,
      link: link || '',
      status,
      isCustom: Boolean(isCustom),
      notes
    });

    markSeen(req.user.id, newActivity.apiKey);

    res.status(201).json(newActivity);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already added or saved this activity.'
      });
    }
    next(error);
  }
};

/**
 * PATCH /api/activities/:id
 * Update status, notes, rating
 */
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, rating } = req.body;

    const activity = await Activity.findOne({ _id: id, user: req.user.id });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    const previousStatus = activity.status;

    if (status !== undefined) {
      activity.status = status;
      if (status === 'done' && previousStatus !== 'done') {
        activity.completedAt = new Date();

        // Increment user XP (+15 XP per completed activity)
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { xp: 15 },
          $set: { lastActiveDate: new Date() }
        });
      } else if (status !== 'done' && previousStatus === 'done') {
        activity.completedAt = null;
        // Undo XP gain
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { xp: -15 }
        });
      }
    }

    if (notes !== undefined) activity.notes = notes;
    if (rating !== undefined) activity.rating = rating;

    await activity.save();

    // Advance active challenge progress if relevant
    await syncChallengeProgress(req.user.id);

    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/activities/:id
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findOneAndDelete({ _id: id, user: req.user.id });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    forgetSeenKeys(req.user.id); // it can be offered again, so rebuild the user's list

    res.status(200).json({ message: 'Activity removed successfully.' });
  } catch (error) {
    next(error);
  }
};

