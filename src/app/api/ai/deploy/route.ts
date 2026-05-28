import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

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
      include: { aiIdentity: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const newAiEnabled = force === true ? true : !user.aiEnabled;

    if (!user.aiIdentity && newAiEnabled) {
      return new NextResponse("AI Identity not found. Please complete setup.", { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { aiEnabled: newAiEnabled },
      });

      if (user.aiIdentity) {
        await tx.aIIdentity.update({
          where: { ownerId: userId },
          data: {
            deployedAt: newAiEnabled ? new Date() : null,
          },
        });
      }
    });

    return NextResponse.json({ aiEnabled: newAiEnabled });
  } catch (error) {
    console.error("AI_DEPLOY_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
