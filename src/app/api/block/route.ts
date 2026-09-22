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

    const { blockedId } = await req.json();

    if (!blockedId) {
      return NextResponse.json({ error: "Missing blockedId" }, { status: 400 });
    }

    if (session.user.id === blockedId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    // Upsert to handle idempotent blocks
    const block = await prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId,
        }
      },
      update: {},
      create: {
        blockerId: session.user.id,
        blockedId,
      }
    });

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get("blockedId");

    if (!blockedId) {
      return NextResponse.json({ error: "Missing blockedId" }, { status: 400 });
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId,
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // If it doesn't exist, prisma throws P2025, but we can treat it as success for idempotency
    return NextResponse.json({ success: true });
  }
}
