import { Queue } from 'bullmq';
import { connection } from './redis';

export const PR_REVIEW_QUEUE_NAME = 'pr-reviews';

// Payload type for the job
export interface ReviewPRJobData {
  installationId: number;
  repositoryId: string;
  githubRepoId: string;
  pullRequestNumber: number;
  owner: string;
  repo: string;
}

export const reviewQueue = new Queue<ReviewPRJobData>(PR_REVIEW_QUEUE_NAME, {
  connection,
});

export const enqueueReviewJob = async (data: ReviewPRJobData) => {
  return await reviewQueue.add(`review-pr-${data.pullRequestNumber}`, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  });
};
