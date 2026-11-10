import {
  getCurrentChallengeForUser,
  createChallengeForUser
} from '../services/challengeService.js';

/**
 * GET /api/challenges/current
 */
export const getCurrentChallenge = async (req, res, next) => {
  try {
    const challenge = await getCurrentChallengeForUser(req.user.id);
    res.status(200).json(challenge);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/challenges
 */
export const createChallenge = async (req, res, next) => {
  try {
    const { activityIds, auto, count } = req.body;
    const challenge = await createChallengeForUser(req.user.id, {
      activityIds,
      auto,
      count
    });

    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};
