# Deployment Guide

This guide explains how to deploy the IntelliPR AI PR Reviewer using a 100% free tech stack.

## Architecture Overview
The application is split into two main components:
1. **The Web App & Webhook Receiver**: A Next.js application.
2. **The Background Worker**: A long-running Node.js process that listens to an Upstash Redis queue.

---

## 1. Upstash (Redis Queue)
1. Go to [Upstash](https://upstash.com/) and create a free Redis database.
2. Copy your Redis connection string (it will start with `rediss://`).
3. **IMPORTANT**: Make sure there are no quotes (`"`) around the URL when you paste it into your environment variables.

---

## 2. Vercel (Web Application)
Vercel hosts the Next.js frontend and the API routes (which receive GitHub webhooks).

1. Go to [Vercel](https://vercel.com/) and import this GitHub repository.
2. Add all of the environment variables from your local `.env` file.
   - *Note: Do not use quotes for any of the environment variables.*
3. Vercel will automatically run the build command (`prisma generate && next build`) and deploy your app.

---

## 3. Render (Background Worker)
Render hosts the Node.js background worker that talks to Gemini and posts reviews.

**Why a Web Service?**
Render removed the free tier for Background Workers. To host this for free, the code includes a dummy `/health` endpoint on port `8080` so that Render treats it as a "Web Service", which has a free tier!

1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Use the following settings:
   - **Build Command**: `npm install && npx prisma generate && npm run worker:build`
   - **Start Command**: `npm run worker:start`
4. Add all of your environment variables (the same ones you added to Vercel).
5. Click **Deploy**.

**Keeping it Awake:**
Render's free Web Services go to sleep after 15 minutes of inactivity. To keep your worker listening to the queue 24/7:
1. Go to [cron-job.org](https://cron-job.org/).
2. Create a cron job that pings your Render URL + `/health` (e.g., `https://your-worker.onrender.com/health`) every **14 minutes**.

---

## 4. Final Configurations

Once Vercel and Render are deployed, you must update your external services to point to your live Vercel URL.

### Clerk (Authentication)
1. Go to the Clerk Dashboard and switch to your Production instance.
2. Ensure Vercel has the new Production `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. *(If you use a `.vercel.app` domain, no DNS configuration is required. Clerk will proxy traffic automatically).*

### GitHub App
1. Go to your GitHub App Settings.
2. Update the **Homepage URL** to your Vercel domain.
3. Update the **Callback URL** and **Setup URL** to `https://your-vercel-domain.vercel.app/api/github/setup`.
4. Update the **Webhook URL** to `https://your-vercel-domain.vercel.app/api/webhooks`.

Your app is now live and automatically reviewing PRs!
