import { getInstallationOctokit } from './client';
import { AIReviewResult } from '../ai/gemini';

export const fetchPullRequestDiff = async (
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> => {
  const octokit = await getInstallationOctokit(installationId);
  
  // Fetch the diff of the PR by setting the accept header to diff
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: {
      format: 'diff',
    },
  });

  return response.data as unknown as string; // The data is the raw diff string
};

export const postPullRequestReview = async (
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
  review: AIReviewResult
) => {
  const octokit = await getInstallationOctokit(installationId);

  // GitHub requires you to submit the review in a specific format.
  // Comments must be attached to the exact commit ID that the PR is currently on,
  // or you can just submit them to the PR generally.
  // We will submit them generally, but mapped to the diff paths and lines.

  // 1. Get the latest commit SHA of the PR
  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });
  const commitId = pullRequest.head.sha;

  // 2. Prepare the comments array
  const formattedComments = review.comments.map(c => ({
    path: c.path,
    line: c.line,
    body: c.body,
  }));

  // 3. Post the Review
  // If there are no line comments, just post a general review comment (summary)
  if (formattedComments.length === 0) {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body: review.summary,
      event: 'COMMENT', // or 'APPROVE', 'REQUEST_CHANGES'
    });
  } else {
    // Post with line comments
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body: review.summary,
      event: 'COMMENT',
      comments: formattedComments,
    });
  }
};
