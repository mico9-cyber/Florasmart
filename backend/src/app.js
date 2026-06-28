import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { API_PREFIX } from './constants/api.js';
import { serverConfig } from './config/server.js';
import { logger } from './config/logger.js';
import { v1Router } from './routes/index.js';
import { notFoundHandler, prismaErrorHandler, globalErrorHandler } from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: serverConfig.clientUrl,
  credentials: true,
}));
app.use(rateLimit({
  windowMs: serverConfig.rateLimitWindowMs,
  limit: serverConfig.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json({ limit: serverConfig.jsonLimit }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.use(API_PREFIX, v1Router);

app.use(notFoundHandler);
app.use(prismaErrorHandler);
app.use(globalErrorHandler);

export default app;

