import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List all connections (incoming and outgoing)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;

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
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const { receiverId } = await req.json();

    if (!receiverId) return new NextResponse("Receiver ID required", { status: 400 });
    if (userId === receiverId) return new NextResponse("Cannot connect to yourself", { status: 400 });

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
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id;
    const { connectionId, status } = await req.json();

    if (!connectionId || !status) return new NextResponse("Data missing", { status: 400 });

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return new NextResponse("Not found", { status: 404 });
    if (connection.receiverId !== userId && status !== "cancelled") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (status === "accepted") {
      // Create conversation if accepted
      const existingConv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: connection.requesterId, participant2Id: connection.receiverId },
            { participant1Id: connection.receiverId, participant2Id: connection.requesterId }
          ]
        }
      });

      if (!existingConv) {
        await prisma.conversation.create({
          data: {
            participant1Id: connection.requesterId,
            participant2Id: connection.receiverId,
          }
        });
      }

      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: "accepted" },
      });

      // Notify requester
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
