import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    // Support optional `force` flag from setup flow
    let force: boolean | undefined;
    try {
      const body = await req.json();
      force = body?.force;
    } catch {
      // No body is fine — treat as toggle
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // If force is explicitly true, always enable. Otherwise toggle.
    const newAiEnabled = force === true ? true : !user.aiEnabled;

    await prisma.user.update({
      where: { id: userId },
      data: { aiEnabled: newAiEnabled },
    });

    // Check if identity exists first
    const identity = await prisma.aIIdentity.findUnique({
      where: { ownerId: userId },
    });

    if (!identity && newAiEnabled) {
      return new NextResponse("AI Identity not found. Please complete setup.", { status: 400 });
    }

    if (identity) {
      await prisma.aIIdentity.update({
        where: { ownerId: userId },
        data: {
          deployedAt: newAiEnabled ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ aiEnabled: newAiEnabled });
  } catch (error) {
    console.error("AI_DEPLOY_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
