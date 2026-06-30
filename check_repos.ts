import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const repos = await prisma.repository.findMany();
  console.log("REPOS:", JSON.stringify(repos, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
