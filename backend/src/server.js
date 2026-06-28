import { environment } from './config/environment.js';
import { serverConfig } from './config/server.js';
import { logger } from './config/logger.js';
import app from './app.js';
import { connectDatabase } from './database/prisma.js';

async function startServer() {
  try {
    await connectDatabase();
    logger.info('Database connection established');

    app.listen(serverConfig.port, () => {
      logger.info('Application startup', {
        port: serverConfig.port,
        environment: environment.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();

