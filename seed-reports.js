const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const normal = await prisma.user.findUnique({ where: { email: 'normal@test.com' } });
  
  if (!admin || !normal) {
    throw new Error('Test users not found');
  }

  const report = await prisma.report.create({
    data: {
      reporterId: normal.id,
      reportedId: admin.id,
      reason: 'Spam message',
    }
  });

  console.log('Test report created:', report);
}

main().catch(console.error).finally(() => prisma.$disconnect());
