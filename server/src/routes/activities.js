import express from 'express';
import { z } from 'zod';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createActivitySchema = z.object({
  apiKey: z.string().optional().nullable(),
  activity: z.string().min(1, 'Activity title is required'),
  type: z.string().min(1, 'Type is required'),
  participants: z.coerce.number().min(1),
  price: z.coerce.number().min(0).max(1).optional(),
  availability: z.coerce.number().min(0).max(1).optional(),
  accessibility: z.string().optional(),
  duration: z.string().optional(),
  kidFriendly: z.boolean().optional(),
  link: z.string().optional(),
  status: z.enum(['saved', 'done', 'skipped']).optional(),
  isCustom: z.boolean().optional(),
  notes: z.string().optional()
});

const updateActivitySchema = z.object({
  status: z.enum(['saved', 'done', 'skipped']).optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional().nullable()
});

// All activity routes require authentication
router.use(protect);

router.get('/', getActivities);
router.post('/', validate(createActivitySchema, 'body'), createActivity);
router.patch('/:id', validate(updateActivitySchema, 'body'), updateActivity);
router.delete('/:id', deleteActivity);

export default router;

