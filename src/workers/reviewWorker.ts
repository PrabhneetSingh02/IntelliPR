import { Worker, Job } from 'bullmq';
import { PR_REVIEW_QUEUE_NAME, ReviewPRJobData } from '../lib/queue/bullmq';
import { connection } from '../lib/queue/redis';
import { fetchPullRequestDiff, postPullRequestReview } from '../lib/github/review';
import { generateReview } from '../lib/ai/gemini';
import prisma from '../lib/db';

console.log('Starting PR Review Worker...');

const worker = new Worker<ReviewPRJobData>(
  PR_REVIEW_QUEUE_NAME,
  async (job: Job<ReviewPRJobData>) => {
    const { installationId, repositoryId, pullRequestNumber, owner, repo } = job.data;
    console.log(`Processing PR Review for ${owner}/${repo}#${pullRequestNumber}`);

    try {
      // 1. Fetch the diff
      const diffStr = await fetchPullRequestDiff(installationId, owner, repo, pullRequestNumber);
      
      if (!diffStr || diffStr.trim() === '') {
        console.log('Empty diff, skipping review.');
        await updatePRStatus(repositoryId, pullRequestNumber, 'reviewed');
        return;
      }

      // 2. Send to Gemini for review
      console.log('Sending diff to AI...');
      const reviewResult = await generateReview(diffStr);
      console.log('Received AI Review Result:', JSON.stringify(reviewResult, null, 2));

      // 3. Post to GitHub
      console.log('Posting review to GitHub...');
      await postPullRequestReview(installationId, owner, repo, pullRequestNumber, reviewResult);

      // 4. Update Database Status & Save Review Stats
      await updatePRStatus(repositoryId, pullRequestNumber, 'reviewed', reviewResult);
      console.log(`Successfully reviewed ${owner}/${repo}#${pullRequestNumber}`);

    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      await updatePRStatus(repositoryId, pullRequestNumber, 'failed');
      throw error; // Let BullMQ handle retries
    }
  },
  { connection }
);

async function updatePRStatus(repositoryId: string, prNumber: number, status: string, reviewResult?: any) {
  try {
    const pr = await prisma.pullRequest.update({
      where: {
        repositoryId_githubPrNumber: {
          repositoryId: repositoryId,
          githubPrNumber: prNumber
        }
      },
      data: { status }
    });

    if (reviewResult) {
      await prisma.review.create({
        data: {
          pullRequestId: pr.id,
          summary: reviewResult.summary,
          issuesFoundCount: reviewResult.comments?.length || 0,
          cost: 0 // Tokens could be calculated here in the future
        }
      });
    }
  } catch (err) {
    console.error('Failed to update PR status in DB:', err);
  }
}

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  process.exit(0);
});
