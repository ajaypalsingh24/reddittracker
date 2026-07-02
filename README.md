# Reddit Negative Thread Tracker

A production-ready MVP for tracking negative Reddit threads and mentions about brands.

## Stack

- Next.js 16 with TypeScript
- Tailwind CSS
- PostgreSQL on Neon
- Prisma ORM
- SerpApi Google Search API
- OpenAI sentiment and risk classification with rule-based fallback
- Resend email alerts
- Render deployment

## Features

- Dashboard for brand monitoring
- Add, edit, delete, and activate brands
- Keyword storage per brand
- Manual scan button
- Protected cron endpoint at `/api/cron/scan`
- Reddit-only Google searches through SerpApi
- Duplicate prevention by URL
- AI sentiment, risk score, reason, and recommended action
- Email alert for every new negative mention
- Alerts table to prevent duplicate alert sends

## Local Setup

1. Install Node.js 22.

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and fill in your values:

```bash
cp .env.example .env
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Create database tables:

```bash
npx prisma db push
```

6. Start the dashboard:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Required:

```env
DATABASE_URL=
SERPAPI_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

For AI classification:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

For email alerts:

```env
RESEND_API_KEY=
ALERT_EMAIL_FROM=
ALERT_EMAIL_TO=
```

## How to Create a GitHub Repo

1. Go to GitHub.
2. Click **New repository**.
3. Name it `reddittracker`.
4. Keep it public or private.
5. Do not add README if this project already has one.
6. Push this local project:

```bash
git remote add origin https://github.com/YOUR_USERNAME/reddittracker.git
git branch -M main
git add .
git commit -m "Create Next.js Reddit tracker"
git push -u origin main
```

## How to Create a Neon PostgreSQL Database

1. Go to Neon.
2. Create a new project.
3. Open **Connection Details**.
4. Copy the pooled PostgreSQL connection string.
5. Put it in `.env` and Render as `DATABASE_URL`.

Example. Add `schema=reddit_tracker` so this app does not touch old tables in the default public schema:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require&schema=reddit_tracker"
```

## How to Create a SerpApi Key

1. Go to SerpApi.
2. Create an account.
3. Open your dashboard.
4. Copy your private API key.
5. Add it as:

```env
SERPAPI_API_KEY="your_key_here"
```

## How to Create Email Alerts with Resend

1. Go to Resend.
2. Create an API key.
3. Add a verified sending domain or use Resend's test sender if allowed on your plan.
4. Add:

```env
RESEND_API_KEY="your_resend_key"
ALERT_EMAIL_FROM="Reddit Tracker <alerts@yourdomain.com>"
ALERT_EMAIL_TO="your@email.com"
```

## Render Deployment Guide

1. Push the project to GitHub.
2. Open Render.
3. Click **New +**.
4. Choose **Web Service**.
5. Connect your GitHub repository.
6. Use these settings:

```text
Runtime:
Node
```

```text
Build Command:
npm ci && npx prisma db push && npm run build
```

```text
Start Command:
npm run start
```

7. Add environment variables:

```env
NODE_VERSION=22.13.1
DATABASE_URL=your_neon_database_url_with_schema_reddit_tracker
SERPAPI_API_KEY=your_serpapi_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4.1-mini
RESEND_API_KEY=your_resend_key
ALERT_EMAIL_FROM=Reddit Tracker <alerts@yourdomain.com>
ALERT_EMAIL_TO=you@example.com
CRON_SECRET=make-a-long-random-secret
NEXT_PUBLIC_APP_URL=https://your-render-service.onrender.com
```

8. Click **Create Web Service**.

## Render Cron Setup

Option A: Use Render Cron Job.

1. Click **New +**.
2. Choose **Cron Job**.
3. Connect the same GitHub repo.
4. Schedule:

```text
0 */6 * * *
```

5. Build command:

```text
npm ci
```

6. Start command:

```text
npm run render:cron
```

7. Add:

```env
CRON_TARGET_URL=https://your-render-service.onrender.com
CRON_SECRET=same_secret_as_web_service
```

Option B: Trigger the endpoint from any scheduler:

```bash
curl -X POST https://your-render-service.onrender.com/api/cron/scan \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## How to Test

1. Open your Render URL or `http://localhost:3000`.
2. Add a brand.
3. Add keywords.
4. Click **Run Scan**.
5. Check the mentions table.
6. For API testing:

```bash
curl -X POST http://localhost:3000/api/scan -H "Content-Type: application/json" -d "{}"
```

7. For cron testing:

```bash
curl -X POST http://localhost:3000/api/cron/scan -H "Authorization: Bearer YOUR_CRON_SECRET"
```
