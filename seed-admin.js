const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hash,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      isAdmin: true,
    }
  });

  await prisma.user.upsert({
    where: { email: 'normal@test.com' },
    update: { isAdmin: false },
    create: {
      email: 'normal@test.com',
      name: 'Normal User',
      password: hash,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      isAdmin: false,
    }
  });
  
  console.log('Test users created.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
