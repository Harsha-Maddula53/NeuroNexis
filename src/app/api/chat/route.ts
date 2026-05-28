import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const senderId = session.user.id;

    if (!conversationId || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    if (content.length > 2000) {
      return new NextResponse("Message is too long", { status: 400 });
    }

    const postRate = checkRateLimit(`chat:post:${senderId}`, { limit: 45, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

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

    const senderIsParticipant =
      conversation.participant1Id === senderId || conversation.participant2Id === senderId;

    if (!senderIsParticipant) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        isAi: false,
      },
    });

    const recipient = conversation.participant1Id === senderId ? conversation.participant2 : conversation.participant1;

    const triggerAi = !recipient.onlineStatus && recipient.aiEnabled;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ message, triggerAi, recipientId: recipient.id });
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const getRate = checkRateLimit(`chat:get:${session.user.id}`, { limit: 180, windowMs: 60_000 });
    if (!getRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(getRate),
        },
      );
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Conversation ID required", { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participant1Id: true, participant2Id: true },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const userId = session.user.id;
    const userIsParticipant =
      conversation.participant1Id === userId || conversation.participant2Id === userId;

    if (!userIsParticipant) {
      return new NextResponse("Forbidden", { status: 403 });
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
