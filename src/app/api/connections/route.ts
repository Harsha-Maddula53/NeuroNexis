import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

// GET: List all connections (incoming and outgoing)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    const getRate = await checkRateLimit(`connections:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!getRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(getRate),
        },
      );
    }

    const incoming = await prisma.connection.findMany({
      where: { receiverId: userId },
      include: { requester: { select: { id: true, name: true, profilePhoto: true } } },
      orderBy: { createdAt: "desc" },
    });

    const outgoing = await prisma.connection.findMany({
      where: { requesterId: userId },
      include: { receiver: { select: { id: true, name: true, profilePhoto: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incoming, outgoing });
  } catch (error) {
    console.error("CONNECTIONS_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a new connection request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    const postRate = await checkRateLimit(`connections:post:${userId}`, { limit: 30, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many connection requests. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

    const body = await req.json();
    const receiverId = typeof body.receiverId === "string" ? body.receiverId.trim() : "";

    if (!receiverId) return new NextResponse("Receiver ID required", { status: 400 });
    if (receiverId.length > 100) return new NextResponse("Receiver ID is invalid", { status: 400 });
    if (userId === receiverId) return new NextResponse("Cannot connect to yourself", { status: 400 });

    const receiverExists = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiverExists) return new NextResponse("Receiver not found", { status: 404 });

    // Check if request already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId },
          { requesterId: receiverId, receiverId: userId }
        ]
      }
    });

    if (existing) return new NextResponse("Connection already exists or requested", { status: 400 });

    const connection = await prisma.connection.create({
      data: {
        requesterId: userId,
        receiverId,
        status: "pending",
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        recipientId: receiverId,
        type: "connection",
        message: `${session.user.name} would like to connect with your AI.`,
      }
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error("CONNECTIONS_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH: Update connection status (accept/decline)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    const patchRate = await checkRateLimit(`connections:patch:${userId}`, { limit: 40, windowMs: 60_000 });
    if (!patchRate.success) {
      return NextResponse.json(
        { error: "Too many update requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(patchRate),
        },
      );
    }

    const body = await req.json();
    const connectionId = typeof body.connectionId === "string" ? body.connectionId.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!connectionId || !status) return new NextResponse("Data missing", { status: 400 });

    if (!["accepted", "declined", "cancelled"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return new NextResponse("Not found", { status: 404 });

    if (status === "cancelled") {
      if (connection.requesterId !== userId) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    } else if (connection.receiverId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (status === "accepted") {
      const orderedParticipantIds = [connection.requesterId, connection.receiverId].sort();

      const existingConv = await prisma.conversation.findFirst({
        where: {
          participant1Id: orderedParticipantIds[0],
          participant2Id: orderedParticipantIds[1],
        }
      });

      if (!existingConv) {
        await prisma.conversation.create({
          data: {
            participant1Id: orderedParticipantIds[0],
            participant2Id: orderedParticipantIds[1],
          }
        });
      }

      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: "accepted" },
      });

      await prisma.notification.create({
        data: {
          recipientId: connection.requesterId,
          type: "activity",
          message: `${session.user.name} accepted your connection request!`,
        }
      });

    } else if (status === "declined" || status === "cancelled") {
      await prisma.connection.delete({
        where: { id: connectionId }
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("CONNECTIONS_PATCH_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
