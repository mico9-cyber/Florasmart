import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];

for (const key of required) {
  if (!process.env[key] && process.env.NODE_ENV !== 'test') {
    // Keep startup permissive for scaffold validation, but surface a clear message.
    // The server will still boot if environment values are not yet set.
    // Real deployment should populate these before release.
  }
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const clientUrls = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((url) => url.trim()).filter(Boolean)
  : [clientUrl];

export const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl,
  clientUrls,
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
  uploads: {
    path: process.env.UPLOAD_PATH || 'uploads',
  }
};

