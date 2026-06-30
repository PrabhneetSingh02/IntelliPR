import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const prs = await prisma.pullRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(JSON.stringify(prs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
