import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
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

    // Delete all related data manually in correct dependency order
    // (Cascade is set on most relations, but we handle Feedback manually
    //  because it depends on Message which depends on Conversation)

    // 1. Feedbacks (depend on Message & User)
    await prisma.feedback.deleteMany({ where: { ownerId: user.id } });

    // 2. Messages sent by the user
    await prisma.message.deleteMany({ where: { senderId: user.id } });

    // 3. Conversations the user participated in
    await prisma.conversation.deleteMany({
      where: {
        OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
      },
    });

    // 4. Connections
    await prisma.connection.deleteMany({
      where: {
        OR: [{ requesterId: user.id }, { receiverId: user.id }],
      },
    });

    // 5. Notifications
    await prisma.notification.deleteMany({ where: { recipientId: user.id } });

    // 6. Behavior Profile (cascade would handle this, but being explicit)
    await prisma.behaviorProfile.deleteMany({ where: { ownerId: user.id } });

    // 7. AI Identity (cascade would handle this, but being explicit)
    await prisma.aIIdentity.deleteMany({ where: { ownerId: user.id } });

    // 8. Finally delete the user
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
