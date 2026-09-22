import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "smoke-1788853710389@test.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { aiIdentity: true, behaviorProfile: true },
  });
  const safeUser = user
    ? { ...user, password: "[redacted]" }
    : null;
  console.log("=== USER ROW ===");
  console.log(JSON.stringify(safeUser, null, 2));

  if (!user) return;

  const identityCount = await prisma.aIIdentity.count({ where: { ownerId: user.id } });
  const behaviorCount = await prisma.behaviorProfile.count({ where: { ownerId: user.id } });
  console.log("=== COUNTS ===");
  console.log(JSON.stringify({ ownerId: user.id, identityCount, behaviorCount }, null, 2));

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participant1Id: user.id }, { participant2Id: user.id }] },
    include: { messages: { orderBy: { timestamp: "asc" } } },
  });
  console.log("=== CONVERSATIONS + MESSAGES ===");
  console.log(JSON.stringify(conversations, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
