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

    // Get messages sent by AI that haven't been reviewed yet
    const pendingReviews = await prisma.message.findMany({
      where: {
        senderId: userId,
        isAi: true,
        feedbacks: {
          none: {}
        }
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
    });

    // Stats for the RightPanel
    const stats = {
        approved: await prisma.feedback.count({ where: { ownerId: userId, feedbackType: "approve" } }),
        corrected: await prisma.feedback.count({ where: { ownerId: userId, feedbackType: "correct" } }),
        rejected: await prisma.feedback.count({ where: { ownerId: userId, feedbackType: "reject" } }),
    };

    const total = stats.approved + stats.corrected + stats.rejected;
    const alignmentScore = total > 0 ? Math.round((stats.approved / total) * 100) : 100;

    return NextResponse.json({
      reviews: pendingReviews,
      stats,
      alignmentScore
    });
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

    const { messageId, feedbackType, correctedText } = body;

    if (!messageId || !feedbackType) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        ownerId: userId,
        feedbackType,
        correctedText,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
