import { App } from 'octokit';

export const getGithubApp = () => {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!appId || !privateKey) {
    throw new Error('Missing GitHub App configuration');
  }

  return new App({
    appId,
    privateKey,
  });
};

export const getInstallationOctokit = async (installationId: number) => {
  const app = getGithubApp();
  return await app.getInstallationOctokit(installationId);
};
