const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const formatExplain = (res) => res.map(row => row['QUERY PLAN']).join('\n');

  console.log("=== Dashboard Recent AI Activity Query ===");
  const dash = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT * FROM "Message" WHERE "senderId" = 'user123' AND "isAi" = true ORDER BY "timestamp" DESC LIMIT 5`);
  console.log(formatExplain(dash));
  console.log("\n");

  console.log("=== Society AI Identities Query ===");
  const soc = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT * FROM "AIIdentity" WHERE "isPublic" = true AND "deployedAt" IS NOT NULL AND "ownerId" != 'user123' ORDER BY "deployedAt" DESC LIMIT 200`);
  console.log(formatExplain(soc));
  console.log("\n");

  console.log("=== Chat Messages Query ===");
  const msg = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT * FROM "Message" WHERE "conversationId" = 'conv123' ORDER BY "timestamp" ASC`);
  console.log(formatExplain(msg));
}

main().finally(() => prisma.$disconnect());
