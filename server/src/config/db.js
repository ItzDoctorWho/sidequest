import mongoose from 'mongoose';
import { config } from './env.js';

// The driver's defaults wait 30s for an unreachable cluster (an IP that fell off the Atlas allow-list,
// a dropped connection), which made every signed-in request look frozen. Fail in seconds instead.
const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  bufferTimeoutMS: 5000
};

mongoose.connection.on('disconnected', () => console.warn('[Database] Disconnected from MongoDB'));
mongoose.connection.on('reconnected', () => console.log('[Database] Reconnected to MongoDB'));

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, CONNECTION_OPTIONS);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // In production/normal run we might exit, but during setup or disconnected test we warn
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};
