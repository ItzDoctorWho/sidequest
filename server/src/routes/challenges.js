import express from 'express';
import { z } from 'zod';
import {
  getCurrentChallenge,
  createChallenge
} from '../controllers/challengeController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createChallengeSchema = z.object({
  activityIds: z.array(z.string()).optional(),
  auto: z.boolean().optional(),
  count: z.coerce.number().min(1).max(10).optional()
});

router.use(protect);

router.get('/current', getCurrentChallenge);
router.post('/', validate(createChallengeSchema, 'body'), createChallenge);

export default router;
