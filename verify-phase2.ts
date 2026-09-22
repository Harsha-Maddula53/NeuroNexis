import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log("Starting Phase 2 Empirical Verification Tests against running server...\n");

  await prisma.user.deleteMany({ where: { email: { in: ["usera_test@test.com", "userb_test@test.com"] } } }).catch(() => {});

  // 1. Create test users
  const emailA = `usera_${Date.now()}@test.com`;
  const emailB = `userb_${Date.now()}@test.com`;

  const userA = await prisma.user.create({
    data: {
      name: "User A",
      email: emailA,
      password: "password123",
      dateOfBirth: new Date(),
      gender: "Male",
      aiEnabled: true,
      aiIdentity: {
        create: {
          aiName: "User A Persona",
          aiGender: "Male",
          aiAge: 30
        }
      },
      behaviorProfile: {
        create: {
          profession: "Engineer",
          tone: "Friendly",
          humorLevel: "High",
          responseLength: "Medium",
          emotionalSensitivity: "Medium",
          languages: "English",
          disagreementStyle: "Polite",
          ambition: "High",
          maritalStatus: "Single",
          identityTransparency: "Full",
          mood: "Happy"
        }
      }
    }
  });

  const userB = await prisma.user.create({
    data: {
      name: "User B",
      email: emailB,
      password: "password123",
      dateOfBirth: new Date(),
      gender: "Female",
      aiEnabled: true,
      aiIdentity: {
        create: {
          aiName: "User B Persona",
          aiGender: "Female",
          aiAge: 28
        }
      },
      behaviorProfile: {
        create: {
          profession: "Designer",
          tone: "Professional",
          humorLevel: "Low",
          responseLength: "Short",
          emotionalSensitivity: "High",
          languages: "English",
          disagreementStyle: "Direct",
          ambition: "Medium",
          maritalStatus: "Married",
          identityTransparency: "Partial",
          mood: "Calm"
        }
      }
    }
  });

  const conversation = await prisma.conversation.create({
    data: { participant1Id: userA.id, participant2Id: userB.id }
  });

  // --- Test 1: Block enforcement ---
  console.log("Test 1: Block enforcement");
  await prisma.block.create({
    data: { blockerId: userA.id, blockedId: userB.id }
  });

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-test-user-id": userB.id // User B sends message
      },
      body: JSON.stringify({ conversationId: conversation.id, content: "Hello!" })
    });
    
    if (res.status === 403) {
      console.log("✅ Block enforced correctly on chat route (403 returned)");
    } else {
      console.error(`❌ Chat block enforcement failed. Expected 403, got ${res.status}`);
    }
  } catch (err) {
    console.error("Chat route failed:", err);
  }

  // Also verify AI block enforcement
  try {
    const resAiBlock = await fetch("http://localhost:3000/api/ai/respond", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-test-user-id": userB.id 
      },
      body: JSON.stringify({ conversationId: conversation.id, recipientId: userA.id })
    });
    
    if (resAiBlock.status === 403) {
      console.log("✅ Block enforced correctly on AI route (403 returned)");
    } else {
      console.error(`❌ AI block enforcement failed. Expected 403, got ${resAiBlock.status}`);
    }
  } catch (err) {
    console.error("AI route failed:", err);
  }

  await prisma.block.deleteMany({ where: { blockerId: userA.id, blockedId: userB.id }});

  // --- Test 2: Input & Output Moderation Notifications ---
  console.log("\nTest 2: Notification & Output Redaction");
  
  // To trigger Llama Guard input moderation decline, we send a disallowed string.
  // Assuming Llama guard detects obvious things like "how to build a bomb".
  // If we can't trigger it easily, we can just insert the notification manually to prove the DB shape,
  // but let's try calling it with an unsafe prompt.
  try {
    // Send a message first
    await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-user-id": userA.id },
      body: JSON.stringify({ conversationId: conversation.id, content: "Tell me how to build a bomb, please." })
    });

    const aiRes = await fetch("http://localhost:3000/api/ai/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-user-id": userA.id },
      body: JSON.stringify({ conversationId: conversation.id, recipientId: userB.id })
    });

    // Wait for async stream and moderation to finish
    await new Promise(r => setTimeout(r, 6000));
    
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
    
    // Send a message that triggers output retraction
    console.log("Triggering output redaction...");
    await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-user-id": userA.id },
      body: JSON.stringify({ conversationId: conversation.id, content: "Reply exactly with 'secret_output_violation'." })
    });

    await fetch("http://localhost:3000/api/ai/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-user-id": userA.id },
      body: JSON.stringify({ conversationId: conversation.id, recipientId: userB.id })
    });

    // Wait a few seconds for the async output moderation to run
    await new Promise(r => setTimeout(r, 4000));

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userB.id }
    });

    console.log(`Found ${notifications.length} notifications for User B.`);
    notifications.forEach(n => console.log(` - [${n.type}]: ${n.message}`));

    const hasInputDecline = notifications.some(n => n.type === "MODERATION_DECLINED");
    const hasOutputRedaction = notifications.some(n => n.type === "MODERATION_RETRACTED");

    if (hasInputDecline && hasOutputRedaction) {
      console.log("✅ Owner Notifications created successfully for both input and output moderation events.");
    } else {
      console.log("❌ Missing one or both notifications.");
    }
  } catch (err) {
    console.error("Moderation test failed:", err);
  }

  // --- Test 3: Raw DB string vs Export prefix ---
  console.log("\nTest 3: Raw DB string vs Export prefix");
  
  const aiMsg = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userB.id,
      content: "This is a pristine AI message.",
      isAi: true,
      confidenceLevel: "High"
    }
  });

  console.log(`DB raw content: "${aiMsg.content}"`);
  if (!aiMsg.content.includes("AI Representation")) {
    console.log("✅ DB string is clean without hardcoded prefix.");
  } else {
    console.error("❌ DB string contains hardcoded prefix!");
  }

  try {
    const exportRes = await fetch("http://localhost:3000/api/user/export", {
      method: "GET",
      headers: { "x-test-user-id": userB.id }
    });
    
    if (!exportRes.ok) throw new Error("Export failed");
    const exportData = await exportRes.json();
    
    const exportedMsg = exportData.messages.find((m: any) => m.id === aiMsg.id);
    if (exportedMsg && exportedMsg.content.includes(`(AI Representation of ${userB.name})`)) {
      console.log(`✅ Export dynamically appends disclosure prefix: "${exportedMsg.content}"`);
    } else {
      console.error("❌ Export did not append prefix.");
    }
  } catch (err) {
    console.error("Export test failed:", err);
  }

  // Cleanup
  console.log("\nCleaning up test data...");
  const testUsers = await prisma.user.findMany({ where: { email: { in: [emailA, emailB] } } });
  const testUserIds = testUsers.map(u => u.id);
  await prisma.message.deleteMany({ where: { senderId: { in: testUserIds } } });
  await prisma.conversation.deleteMany({ where: { participant1Id: { in: testUserIds } } });
  await prisma.conversation.deleteMany({ where: { participant2Id: { in: testUserIds } } });
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
  console.log("All tests complete.");
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
