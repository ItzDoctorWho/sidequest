import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boredom-buster',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_jwt_key_boredom_buster_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  env: process.env.NODE_ENV || 'development'
};

