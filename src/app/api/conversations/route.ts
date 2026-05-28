import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const rate = checkRateLimit(`conversations:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            onlineStatus: true,
            aiEnabled: true,
            profilePhoto: true,
            behaviorProfile: true, // For RightPanel status
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            onlineStatus: true,
            aiEnabled: true,
            profilePhoto: true,
            behaviorProfile: true, // For RightPanel status
          },
        },
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("CONVERSATIONS_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const recipientId = typeof body.recipientId === "string" ? body.recipientId.trim() : "";
    const userId = session.user.id;

    const rate = checkRateLimit(`conversations:post:${userId}`, { limit: 30, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    if (!recipientId) {
      return new NextResponse("Recipient ID required", { status: 400 });
    }

    if (recipientId.length > 100) {
      return new NextResponse("Recipient ID is invalid", { status: 400 });
    }

    if (recipientId === userId) {
      return new NextResponse("Cannot create conversation with yourself", { status: 400 });
    }

    const orderedParticipantIds = [userId, recipientId].sort();

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        participant1Id: orderedParticipantIds[0],
        participant2Id: orderedParticipantIds[1],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: orderedParticipantIds[0],
          participant2Id: orderedParticipantIds[1],
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("CONVERSATION_CREATE_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
