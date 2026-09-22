import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { eventBus } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return new NextResponse('Conversation ID required', { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participant1Id: true, participant2Id: true },
  });

  if (!conversation) {
    return new NextResponse('Conversation not found', { status: 404 });
  }

  const userId = session.user.id;
  const userIsParticipant =
    conversation.participant1Id === userId || conversation.participant2Id === userId;

  if (!userIsParticipant) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial ping to keep the connection alive
      controller.enqueue(encoder.encode(`: ping\n\n`));

      const onMessage = (payload: any) => {
        // payload should contain the new message object
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const eventName = `chat:${conversationId}`;
      eventBus.on(eventName, onMessage);

      // Keepalive interval (every 15 seconds)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (err) {
          clearInterval(keepAlive);
          eventBus.off(eventName, onMessage);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        eventBus.off(eventName, onMessage);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
