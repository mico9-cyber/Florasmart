import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import { environment } from './environment.js';

const logsDir = path.resolve(process.cwd(), 'src', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, errors, json, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: time, stack, ...meta }) => {
  const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${time} ${level}: ${stack || message}${metaText}`;
});

export const logger = winston.createLogger({
  level: environment.nodeEnv === 'development' ? 'debug' : 'info',
  format: combine(timestamp(), errors({ stack: true })),
  defaultMeta: { service: 'florasmart-backend' },
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), consoleFormat),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      level: 'error',
      filename: path.join(logsDir, 'error.log'),
      format: combine(timestamp(), json()),
    }),
  ],
});

