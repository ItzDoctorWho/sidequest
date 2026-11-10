import express from 'express';
import { getUserStats } from '../services/statsService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

