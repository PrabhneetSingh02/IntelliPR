import { PrismaClient } from '@prisma/client';
import { App } from 'octokit';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function syncRepos() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!appId || !privateKey) {
    throw new Error('Missing GitHub App configuration');
  }

  const app = new App({
    appId,
    privateKey,
  });

  console.log('Fetching installations...');
  const { data: installations } = await app.octokit.rest.apps.listInstallations();
  
  if (installations.length === 0) {
    console.log('No installations found for this App. Are you sure you installed it on a repo?');
    return;
  }

  console.log(`Found ${installations.length} installations. syncing...`);

  // Create a dummy user to own the repositories since we are doing this offline
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        githubId: 'admin',
        email: 'admin@pr-reviewer.test',
      }
    });
  }

  for (const installation of installations) {
    const octokit = await app.getInstallationOctokit(installation.id);
    const { data: { repositories } } = await octokit.rest.apps.listReposAccessibleToInstallation();
    
    console.log(`Found ${repositories.length} repos for installation ${installation.id}`);
    
    for (const repo of repositories) {
      await prisma.repository.upsert({
        where: { githubRepoId: repo.id.toString() },
        update: {
          isActive: true,
          fullName: repo.full_name,
        },
        create: {
          userId: user.id,
          githubRepoId: repo.id.toString(),
          fullName: repo.full_name,
          isActive: true,
        }
      });
      console.log(`Synced repo: ${repo.full_name}`);
    }
  }

  console.log('Sync complete!');
}

syncRepos().catch(console.error).finally(() => prisma.$disconnect());
