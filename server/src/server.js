import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { warmCatalogue } from './services/boredApi.js';

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log(`[Server] Boredom Buster API listening on port ${config.port} (${config.env})`);
    warmCatalogue();
  });
};

startServer();

