import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean up existing data to avoid unique constraint errors during multiple seed runs
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.behaviorProfile.deleteMany();
  await prisma.aIIdentity.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Female',
      aiEnabled: true,
      onlineStatus: true,
      aiIdentity: {
        create: {
          aiName: 'Alice AI',
          aiGender: 'Female',
          aiAge: 34,
          isPublic: true,
        },
      },
      behaviorProfile: {
        create: {
          profession: 'Software Engineer',
          tone: 'Friendly',
          humorLevel: 'Light',
          responseLength: 'Medium',
          emotionalSensitivity: 'Medium',
          languages: 'English',
          disagreementStyle: 'Diplomatic',
          ambition: 'High',
          maritalStatus: 'Single',
          identityTransparency: 'Always',
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: hashedPassword,
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Male',
      aiEnabled: true,
      onlineStatus: false,
      aiIdentity: {
        create: {
          aiName: 'Bob AI',
          aiGender: 'Male',
          aiAge: 39,
          isPublic: true,
        },
      },
      behaviorProfile: {
        create: {
          profession: 'Architect',
          tone: 'Professional',
          humorLevel: 'None',
          responseLength: 'Detailed',
          emotionalSensitivity: 'Low',
          languages: 'English',
          disagreementStyle: 'Assertive',
          ambition: 'Medium',
          maritalStatus: 'Married',
          identityTransparency: 'Often',
        },
      },
    },
  });

  // Create Connection
  await prisma.connection.create({
    data: {
      requesterId: user1.id,
      receiverId: user2.id,
      status: 'accepted',
    },
  });

  // Create Conversation
  const conversation = await prisma.conversation.create({
    data: {
      participant1Id: user1.id,
      participant2Id: user2.id,
    },
  });

  // Create Messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: user1.id,
        content: 'Hi Bob!',
        isAi: false,
      },
      {
        conversationId: conversation.id,
        senderId: user2.id,
        content: 'Hello Alice. (AI Representation)',
        isAi: true,
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
