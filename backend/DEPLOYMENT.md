# FloraSmart Backend Deployment Guide

## Prerequisites

- Node.js 20+
- MySQL 8+
- npm or yarn

## Production Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="mysql://user:password@host:3306/florasmart_db"
JWT_ACCESS_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=FloraSmart <noreply@florasmart.com>
UPLOAD_DIR=uploads
REPORTS_DIR=reports
```

### 3. Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE florasmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### 4. Start Server

```bash
npm start
```

Or with process manager:

```bash
npm install -g pm2
pm2 start src/server.js --name florasmart-backend
```

## Deployment Checklist

- [ ] MySQL database created and running
- [ ] .env configured with production values
- [ ] JWT secrets generated (use `openssl rand -hex 32`)
- [ ] SMTP configured with Gmail app password
- [ ] CORS origin set to frontend URL
- [ ] NODE_ENV=production
- [ ] Prisma migrations applied
- [ ] Seed data loaded
- [ ] Reports directory exists and writable
- [ ] Uploads directory exists and writable

## Platform Notes

### Railway / Render

1. Set build command: `npm install && npx prisma generate && npx prisma migrate deploy`
2. Set start command: `npm start`
3. Add a MySQL add-on or external database URL
4. Set all environment variables in the dashboard

### VPS (Ubuntu)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install -y mysql-server
sudo mysql_secure_installation

# Clone and setup
git clone <repo> /var/www/florasmart-backend
cd /var/www/florasmart-backend
npm install
npx prisma migrate deploy
npx prisma db seed

# Use PM2 for process management
npm install -g pm2
pm2 start src/server.js --name florasmart-backend
pm2 save
pm2 startup
```

## CORS Configuration

The backend uses the `FRONTEND_URL` environment variable for CORS. In development this defaults to `http://localhost:5173`. In production, set it to your actual frontend URL.

## Health Check

After deployment, verify:

```bash
curl https://your-api.com/api/v1/health
```

Expected response:
```json
{"success":true,"message":"FloraSmart API is healthy","data":{"status":"ok","environment":"production","timestamp":"..."},"meta":null}
```

## Known Limitations

- PDF reports are HTML-based (not real PDF rendering)
- Email sending requires Gmail app password configuration
- SMS notifications are marked as placeholder
- No background job queue for async tasks
- Rate limiting is global (not per-endpoint)
- Audit logging is a no-op (no audit table in DB)
