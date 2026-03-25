import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    // Find conversations where the current user is a participant,
    // then fetch AI messages sent on their behalf (senderId != userId but isAi = true)
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Fetch AI messages in the user's conversations that don't have feedback yet
    const pendingReviews = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        isAi: true,
        feedbacks: { none: {} },
      },
      include: {
        conversation: {
          include: {
            participant1: { select: { id: true, name: true } },
            participant2: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    return NextResponse.json(pendingReviews);
  } catch (error) {
    console.error("REVIEW_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { messageId, action, correction } = body;

    if (!messageId || !action) {
      return new NextResponse("Missing messageId or action", { status: 400 });
    }

    // Save feedback to the database
    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        ownerId: userId,
        feedbackType: action,
        correctedText: correction || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
