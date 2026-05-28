import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Delete all Feedback
    await prisma.feedback.deleteMany({
      where: { ownerId: user.id }
    });

    // 2. Delete all Conversations (and thus messages via Cascade, but since messages 
    // are relation on conversation, we must clear messages first if no cascade is strictly enforced
    // In our manual delete we did messages then conversations. Let's do that for safety.
    await prisma.message.deleteMany({
      where: { senderId: user.id }
    });

    await prisma.conversation.deleteMany({
      where: {
        OR: [
          { participant1Id: user.id },
          { participant2Id: user.id }
        ]
      }
    });

    // 3. Reset BehaviorProfile
    await prisma.behaviorProfile.upsert({
      where: { ownerId: user.id },
      update: {
        profession: "Unknown",
        tone: "Neutral",
        humorLevel: "Moderate",
        responseLength: "Medium",
        emotionalSensitivity: "Medium",
        languages: "English",
        disagreementStyle: "Diplomatic",
        ambition: "Steady",
        maritalStatus: "Single",
        identityTransparency: "Often"
      },
      create: {
        ownerId: user.id,
        profession: "Unknown",
        tone: "Neutral",
        humorLevel: "Moderate",
        responseLength: "Medium",
        emotionalSensitivity: "Medium",
        languages: "English",
        disagreementStyle: "Diplomatic",
        ambition: "Steady",
        maritalStatus: "Single",
        identityTransparency: "Often"
      }
    });

    return NextResponse.json({ success: true, message: "AI Training reset successfully." });
  } catch (error) {
    console.error("Reset AI training error:", error);
    return NextResponse.json({ error: "Failed to reset AI training." }, { status: 500 });
  }
}
