import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { conversationId, content } = await req.json();
    const senderId = (session.user as any).id;

    if (!conversationId || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // 1. Create the user's message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        isAi: false,
      },
    });

    // 2. Fetch the conversation and the other participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: { select: { id: true, onlineStatus: true, aiEnabled: true } },
        participant2: { select: { id: true, onlineStatus: true, aiEnabled: true } },
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const recipient = conversation.participant1Id === senderId ? conversation.participant2 : conversation.participant1;

    // 3. Trigger AI response if recipient is offline and AI is enabled
    if (!recipient.onlineStatus && recipient.aiEnabled) {
      // Fetch recent messages for context
      const recentMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: "desc" },
        take: 10,
        include: { sender: { select: { name: true } } },
      });

      // Reverse to get chronological order
      const formattedMessages = recentMessages.reverse().map((m) => ({
        senderName: m.sender.name,
        content: m.content,
      }));

      // Trigger AI respond API (calling it internally or using its logic)
      // For simplicity in this setup, we'll hit the route we reviewed
      const protocol = req.url.startsWith('https') ? 'https' : 'http';
      const host = req.headers.get('host');
      const aiResponse = await fetch(`${protocol}://${host}/api/ai/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '', // Pass through cookies for auth if needed
        },
        body: JSON.stringify({
          conversationId,
          senderId,
          recipientId: recipient.id,
          recentMessages: formattedMessages,
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI response failed:", await aiResponse.text());
      }
    }

    // 4. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Conversation ID required", { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("CHAT_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
