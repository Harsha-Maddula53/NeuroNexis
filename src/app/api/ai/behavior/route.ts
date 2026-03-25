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
    const behaviorProfile = await prisma.behaviorProfile.findUnique({
      where: { ownerId: userId },
    });

    return NextResponse.json(behaviorProfile || {});
  } catch (error) {
    console.error("BEHAVIOR_PROFILE_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id;

    const behaviorProfile = await prisma.behaviorProfile.upsert({
      where: { ownerId: userId },
      update: {
        ...body,
        ownerId: undefined, // Don't try to update ownerId
      },
      create: {
        ...body,
        ownerId: userId,
      },
    });

    return NextResponse.json(behaviorProfile);
  } catch (error) {
    console.error("BEHAVIOR_PROFILE_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
