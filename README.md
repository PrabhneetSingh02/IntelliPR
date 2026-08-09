# IntelliPR 🚀

IntelliPR is an automated, AI-powered Pull Request reviewer that seamlessly integrates with GitHub. By leveraging the power of Google's Gemini AI, it automatically analyzes new Pull Requests, detects bugs, security vulnerabilities, and architectural flaws, and posts a detailed code review directly to GitHub.

**🌍 Live Demo:** [https://intelli-pr.vercel.app](https://intelli-pr.vercel.app)

## ✨ Features

- **Automated Code Reviews**: Instantly reviews code changes using Gemini 2.5 Flash.
- **GitHub App Integration**: Seamlessly connects to your GitHub repositories via a custom GitHub App.
- **Real-Time Sync**: Automatically syncs repository access when you install or uninstall the app on new repositories.
- **Asynchronous Processing**: Uses BullMQ and Redis to reliably queue and process PRs in the background without dropping webhooks.
- **Beautiful Dashboard**: A Next.js dashboard to track your connected repositories and view a history of all analyzed Pull Requests.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Queue**: [BullMQ](https://docs.bullmq.io/) + Redis (hosted on [Upstash](https://upstash.com/))
- **AI**: Google [Gemini API](https://ai.google.dev/)
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/intellipr.git
cd intellipr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following keys. (See `DOCUMENTATION.md` for instructions on how to generate these).

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# GitHub App
GITHUB_APP_ID="..."
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="..."

# Redis
REDIS_URL="..."

# AI
GEMINI_API_KEY="..."
```

### 4. Run Database Migrations
```bash
npx prisma db push
```

### 5. Start the Application

You will need to run two processes simultaneously in separate terminals:

**Terminal 1: Next.js Web Server**
```bash
npm run dev
```

**Terminal 2: Background Worker (BullMQ)**
```bash
npm run worker
```

## 🏗️ How it works
1. A developer opens a Pull Request on a connected GitHub repository.
2. GitHub fires a webhook to the `/api/webhooks` endpoint.
3. The API verifies the webhook and pushes a job to the Redis queue.
4. The background worker picks up the job, fetches the Git diff, and sends it to Gemini.
5. Gemini generates a structured code review.
6. The worker posts the review as a comment directly on the GitHub PR.

---
*Built with ❤️ by Prabhneet Singh*
