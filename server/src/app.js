import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import suggestionRoutes from './routes/suggestions.js';
import activityRoutes from './routes/activities.js';
import challengeRoutes from './routes/challenges.js';
import statsRoutes from './routes/stats.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: config.clientUrl || '*',
  credentials: true
}));
app.use(express.json());

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Boredom Buster API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/stats', statsRoutes);

// 404 & Central Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

