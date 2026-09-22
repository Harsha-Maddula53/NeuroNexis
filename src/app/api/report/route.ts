import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportedId, messageId, reason } = await req.json();

    if (!reportedId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (session.user.id === reportedId) {
      return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId,
        messageId: messageId || null,
        reason,
        status: "pending"
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
