import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      aiIdentity: { select: { id: true, aiName: true, ownerId: true } },
      behaviorProfile: {
        select: { id: true, profession: true, tone: true, ownerId: true },
      },
    },
  });
  console.log("=== RECENT USERS ===");
  console.log(JSON.stringify(users, null, 2));

  const smoke = await prisma.user.findMany({
    where: { email: { startsWith: "smoke-" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      aiIdentity: true,
      behaviorProfile: true,
    },
  });
  console.log("=== SMOKE USERS (full identity + behaviorProfile rows) ===");
  console.log(JSON.stringify(smoke, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
