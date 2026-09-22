import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";
import { habituateUserIdentity } from "@/lib/ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const getRate = await checkRateLimit(`user:review:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!getRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(getRate),
        },
      );
    }

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
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const postRate = await checkRateLimit(`user:review:post:${userId}`, { limit: 40, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

    const body = await req.json();

    const messageId = typeof body.messageId === "string" ? body.messageId.trim() : "";
    const feedbackType = typeof body.feedbackType === "string" ? body.feedbackType : "";
    const correctedText = typeof body.correctedText === "string" ? body.correctedText.trim() : null;

    if (!messageId || !feedbackType) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    if (!new Set(["approve", "correct", "reject"]).has(feedbackType)) {
      return new NextResponse("Invalid feedback type", { status: 400 });
    }

    if (feedbackType === "correct" && !correctedText) {
      return new NextResponse("Corrected text is required", { status: 400 });
    }

    if (correctedText && correctedText.length > 2000) {
      return new NextResponse("Corrected text is too long", { status: 400 });
    }

    const targetMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        isAi: true,
      },
    });

    if (!targetMessage || !targetMessage.isAi || targetMessage.senderId !== userId) {
      return new NextResponse("Message not eligible for review", { status: 403 });
    }

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        messageId,
        ownerId: userId,
      },
      select: { id: true },
    });

    if (existingFeedback) {
      return new NextResponse("Feedback already submitted", { status: 409 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        ownerId: userId,
        feedbackType,
        correctedText,
      },
    });

    // Trigger Habituation learning loop to adjust BehaviorProfile from feedback
    habituateUserIdentity(userId, 'feedback', {
      messageId,
      feedbackType,
      correctedText
    }).catch(err => console.error("Habituation error (feedback):", err));

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("REVIEW_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
