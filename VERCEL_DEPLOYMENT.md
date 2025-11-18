# Vercel Deployment Guide

This project has been configured to work with Vercel's serverless functions.

## Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

1. **DATABASE_URL** - Your Neon Database connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Get this from your Neon dashboard

2. **SESSION_SECRET** - A secret key for signing session cookies
   - Generate a random string (e.g., `openssl rand -base64 32`)
   - Used for authentication cookie signing

3. **AUTH_USERNAME** - Username for admin login
   - Set your desired admin username

4. **AUTH_PASSWORD** - Password for admin login
   - Set your desired admin password

5. **APP_DOMAIN** (Optional) - Your production domain
   - If not set, Vercel will use `VERCEL_URL` automatically
   - Only needed if you want to override the default domain for certificate QR codes

## Deployment Steps

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will automatically detect the configuration

2. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all the required variables listed above
   - Make sure to set them for Production, Preview, and Development environments

3. **Deploy**
   - Push to your main branch or use Vercel CLI: `vercel --prod`
   - Vercel will automatically build and deploy

## Project Structure

- **`api/`** - Serverless API functions (automatically detected by Vercel)
- **`client/`** - React frontend application
- **`shared/`** - Shared TypeScript schemas
- **`vercel.json`** - Vercel configuration

## API Routes

All API routes are now serverless functions:
- `/api/login` - POST - Admin login
- `/api/logout` - POST - Admin logout
- `/api/auth/status` - GET - Check authentication status
- `/api/trainings` - GET, POST - List/create trainings
- `/api/trainings/[id]` - GET, PATCH, DELETE - Training operations
- `/api/trainings/[id]/trainees` - GET - Get trainees for a training
- `/api/trainees` - GET - List all trainees
- `/api/trainees/[id]` - GET, PATCH, DELETE - Trainee operations
- `/api/trainees/upload` - POST - Upload Excel file with trainees
- `/api/verify/[id]` - GET - Public certificate verification

## Database

The project uses Neon Database (PostgreSQL) with Drizzle ORM. The connection is configured for serverless environments and uses connection pooling automatically.

## Local Development

For local development, you can still use the Express server:

```bash
npm run dev
```

This will start the Express server on port 5000 with Vite dev server.

## Notes

- The serverless functions use cookie-based authentication instead of sessions
- File uploads use `/tmp` directory (the only writable location in serverless)
- Database connections are automatically pooled by Neon's serverless driver
- All API routes require authentication except `/api/verify/[id]`

