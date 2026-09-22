import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = "http://localhost:3000";

import { encode } from "next-auth/jwt";

test("AI Ownership API Security", async (t) => {
  // Setup users
  await prisma.moderationLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ["attacker@test.com", "victim@test.com", "third@test.com"] } } });
  
  const attacker = await prisma.user.create({
    data: { name: "Attacker", email: "attacker@test.com", password: "x", dateOfBirth: new Date("1990-01-01"), gender: "Other" }
  });
  
  const victim = await prisma.user.create({
    data: { name: "Victim", email: "victim@test.com", password: "x", dateOfBirth: new Date("1990-01-01"), gender: "Other" }
  });

  const victimAi = await prisma.aIIdentity.create({
    data: { owner: { connect: { id: victim.id } }, aiName: "Victim AI", aiGender: "Other", aiAge: 30 }
  });
  
  await prisma.behaviorProfile.create({
    data: { 
      owner: { connect: { id: victim.id } }, 
      profession: "test", tone: "formal", humorLevel: "low", responseLength: "short", 
      emotionalSensitivity: "high", languages: "English", disagreementStyle: "polite", 
      ambition: "high", maritalStatus: "single", identityTransparency: "transparent" 
    }
  });

  const thirdParty = await prisma.user.create({
    data: { name: "Third", email: "third@test.com", password: "x", dateOfBirth: new Date("1990-01-01"), gender: "Other" }
  });

  const conversation = await prisma.conversation.create({
    data: { participant1Id: thirdParty.id, participant2Id: victim.id }
  });

  const token = await encode({
    secret: process.env.NEXTAUTH_SECRET || "RbFK0CCrOFoZxrOeIvoc3aCYhUK+aUvsc5MpHrnpHbY=",
    token: { sub: attacker.id, email: attacker.email, name: attacker.name },
    maxAge: 30 * 24 * 60 * 60,
    salt: "next-auth.session-token"
  });

  await t.test("Attacker cannot force victim AI to respond if attacker is not recipient", async () => {
    const res = await fetch(`${API_URL}/api/ai/respond`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-test-user-id": attacker.id,
        "x-test-bypass": "true"
      },
      body: JSON.stringify({ conversationId: conversation.id, recipientId: victim.id })
    });
    // Attacker tries to force victim AI to generate a message (recipientId = victim.id means we want Victim AI to reply)
    // Wait, the API requires the requestor to OWN the AI (requestor == recipientId)
    assert.strictEqual(res.status, 403);
  });

  // Cleanup
  await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
  await prisma.conversation.delete({ where: { id: conversation.id } });
  await prisma.behaviorProfile.delete({ where: { ownerId: victim.id } });
  await prisma.aIIdentity.delete({ where: { ownerId: victim.id } });
  await prisma.user.deleteMany({ where: { id: { in: [attacker.id, victim.id] } } });
});


