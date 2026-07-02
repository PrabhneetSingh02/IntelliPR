import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { enqueueReviewJob } from '@/lib/queue/bullmq';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const verifySignature = (req: NextRequest, body: string) => {
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature || !WEBHOOK_SECRET) return false;

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(body).digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  if (!verifySignature(req, bodyText)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = req.headers.get('x-github-event');
  const payload = JSON.parse(bodyText);

  try {
    if (event === 'pull_request') {
      const { action, pull_request, repository, installation } = payload;

      // We care about new PRs, new commits, reopened PRs, and draft PRs marked as ready
      console.log("[Webhook] Pull request event:", action, pull_request.number, repository.id, installation.id);
      if (['opened', 'synchronize', 'reopened', 'ready_for_review'].includes(action)) {

        // Find the repository in our DB
        const dbRepo = await prisma.repository.findUnique({
          where: { githubRepoId: repository.id.toString() }
        });

        if (dbRepo && dbRepo.isActive) {
          // Create or update the PullRequest record
          const pr = await prisma.pullRequest.upsert({
            where: {
              repositoryId_githubPrNumber: {
                repositoryId: dbRepo.id,
                githubPrNumber: pull_request.number
              }
            },
            update: {
              status: 'pending', // Reset status if new commits are pushed
            },
            create: {
              repositoryId: dbRepo.id,
              githubPrNumber: pull_request.number,
              status: 'pending'
            }
          });

          // Enqueue a job in Redis/BullMQ to process this PR
          await enqueueReviewJob({
            installationId: installation.id,
            repositoryId: dbRepo.id,
            githubRepoId: repository.id.toString(),
            pullRequestNumber: pull_request.number,
            owner: repository.owner.login,
            repo: repository.name,
          });

          console.log(`[Webhook] PR #${pull_request.number} queued for review.`);
        }
      }
    }

    if (event === 'installation' && payload.action === 'deleted') {
      // Handle app uninstallation
      const repos = payload.repositories || [];
      for (const repo of repos) {
        await prisma.repository.update({
          where: { githubRepoId: repo.id.toString() },
          data: { isActive: false }
        });
      }
    }

    if (event === 'installation_repositories') {
      const { action, installation, repositories_added, repositories_removed } = payload;

      // We need to find the user associated with this installation.
      // Since all repos for an installation share the same user, we can find the user from the first existing repo.
      const existingRepo = await prisma.repository.findFirst({
        where: { installationId: installation.id }
      });
      console.log("[Webhook] Existing repo:", existingRepo);
      const userId = existingRepo?.userId;

      if (action === 'added' || action === 'removed') {
        if (repositories_added && repositories_added.length > 0 && userId) {
          for (const repo of repositories_added) {
            await prisma.repository.upsert({
              where: { githubRepoId: repo.id.toString() },
              update: {
                userId: userId,
                isActive: true,
                fullName: repo.full_name,
                installationId: installation.id,
              },
              create: {
                userId: userId,
                githubRepoId: repo.id.toString(),
                fullName: repo.full_name,
                isActive: true,
                installationId: installation.id,
              }
            });
          }
        }

        if (repositories_removed && repositories_removed.length > 0) {
          for (const repo of repositories_removed) {
            await prisma.repository.update({
              where: { githubRepoId: repo.id.toString() },
              data: { isActive: false }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
