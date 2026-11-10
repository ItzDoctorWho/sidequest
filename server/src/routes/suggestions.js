import express from 'express';
import {
  getRandomSuggestion,
  browseSuggestions
} from '../controllers/suggestionController.js';
import { validate, suggestionQuerySchema } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Suggestions are public: anyone can browse ideas. When a valid token is sent,
// activities the user already saved/done/skipped are left out.
router.use(optionalAuth);

router.get('/random', validate(suggestionQuerySchema), getRandomSuggestion);
router.get('/browse', validate(suggestionQuerySchema), browseSuggestions);

export default router;

