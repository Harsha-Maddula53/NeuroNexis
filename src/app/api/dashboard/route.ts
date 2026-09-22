export const dynamic = 'force-dynamic';
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
    const rate = await checkRateLimit(`dashboard:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        aiEnabled: true,
        aiIdentity: {
          select: {
            id: true,
            aiName: true,
            aiAge: true,
            aiGender: true,
            isPublic: true,
            location: true,
            deployedAt: true,
          },
        },
        behaviorProfile: {
          select: {
            profession: true,
            tone: true,
            humorLevel: true,
            responseLength: true,
            emotionalSensitivity: true,
            languages: true,
            disagreementStyle: true,
            ambition: true,
            maritalStatus: true,
            identityTransparency: true,
            mood: true,
            updatedAt: true,
          },
        },
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
    const recentActivityRaw = await prisma.message.findMany({
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

    const recentActivity = recentActivityRaw.map((message) => {
      const targetName =
        message.conversation.participant1Id === userId
          ? message.conversation.participant2.name
          : message.conversation.participant1.name;

      return {
        ...message,
        targetName,
      };
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
