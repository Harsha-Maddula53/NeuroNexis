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
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { recipientId } = await req.json();
    const userId = (session.user as any).id;

    if (!recipientId) {
      return new NextResponse("Recipient ID required", { status: 400 });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: recipientId },
          { participant1Id: recipientId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: recipientId,
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("CONVERSATION_CREATE_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
