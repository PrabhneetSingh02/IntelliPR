import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { getInstallationOctokit } from '@/lib/github/client';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const searchParams = req.nextUrl.searchParams;
  const installationIdStr = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  if (!installationIdStr) {
    return NextResponse.json({ error: 'Missing installation_id' }, { status: 400 });
  }

  const installationId = parseInt(installationIdStr, 10);

  try {
    // 1. Ensure user exists in our DB (Clerk webhook usually handles this, but good to ensure)
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // Create user with dummy email for now since we don't have it here. 
      // Ideally, you'd sync users via Clerk webhooks.
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@placeholder.com`,
        }
      });
    }

    // 2. Fetch repositories for this installation from GitHub
    const octokit = await getInstallationOctokit(installationId);
    
    // Use pagination to get all repos if there are many, but this is fine for MVP
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
    
    const repositories = data.repositories;

    // 3. Upsert repositories into our database linked to the user
    for (const repo of repositories) {
      await prisma.repository.upsert({
        where: { githubRepoId: repo.id.toString() },
        update: {
          userId: user.id,
          isActive: true,
          fullName: repo.full_name,
          installationId: installationId,
        },
        create: {
          userId: user.id,
          githubRepoId: repo.id.toString(),
          fullName: repo.full_name,
          isActive: true,
          installationId: installationId,
        }
      });
    }

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL('/dashboard', req.url));

  } catch (error: any) {
    console.error('Error during GitHub setup:', error);
    return NextResponse.json({ error: 'Failed to complete setup', details: String(error) }, { status: 500 });
  }
}
