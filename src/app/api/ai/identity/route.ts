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
    const aiIdentity = await prisma.aIIdentity.findUnique({
      where: { ownerId: userId },
    });

    return NextResponse.json(aiIdentity || {});
  } catch (error) {
    console.error("AI_IDENTITY_GET_ERROR:", error);
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
    const { aiName, aiAge, aiGender, isPublic, location, phoneNumber } = body;
    const userId = (session.user as any).id;

    const aiIdentity = await prisma.aIIdentity.upsert({
      where: { ownerId: userId },
      update: {
        aiName,
        aiAge: parseInt(aiAge),
        aiGender,
        isPublic: isPublic === "true" || isPublic === true,
        location,
        phoneNumber,
      },
      create: {
        ownerId: userId,
        aiName,
        aiAge: parseInt(aiAge),
        aiGender,
        isPublic: isPublic === "true" || isPublic === true,
        location,
        phoneNumber,
      },
    });

    return NextResponse.json(aiIdentity);
  } catch (error) {
    console.error("AI_IDENTITY_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
