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

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        aiIdentity: true,
        behaviorProfile: true,
        _count: {
          select: {
            messages: true,
            conversations1: true,
            conversations2: true,
          }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get recent AI activity (messages sent by AI on behalf of user)
    const recentActivity = await prisma.message.findMany({
      where: {
        senderId: userId,
        isAi: true,
      },
      include: {
        conversation: {
          include: {
            participant1: { select: { name: true } },
            participant2: { select: { name: true } }
          }
        }
      },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    // Actual network stats
    const [activeAIs, totalMessages] = await Promise.all([
      prisma.aIIdentity.count({ where: { deployedAt: { not: null } } }),
      prisma.message.count(),
    ]);

    const networkStats = {
      activeAIs,
      totalMessages,
    };

    return NextResponse.json({
      user,
      recentActivity,
      networkStats
    });
  } catch (error) {
    console.error("DASHBOARD_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
