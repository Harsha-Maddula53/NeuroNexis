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
    const getRate = await checkRateLimit(`ai:identity:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!getRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(getRate),
        },
      );
    }

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
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const userId = session.user.id;
    const postRate = await checkRateLimit(`ai:identity:post:${userId}`, { limit: 20, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many updates. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

    const aiName = String(body.aiName ?? "").trim();
    const parsedAge = Number.parseInt(String(body.aiAge), 10);
    const aiGender = String(body.aiGender ?? "").trim();
    const isPublic = body.isPublic;
    const location = String(body.location ?? "").trim();
    const phoneNumber = String(body.phoneNumber ?? "").trim();

    if (!aiName || aiName.length > 100) {
      return new NextResponse("Invalid AI name", { status: 400 });
    }

    if (!Number.isFinite(parsedAge) || parsedAge < 18) {
      return new NextResponse("Invalid AI age", { status: 400 });
    }

    const allowedGenders = new Set(["male", "female", "non-binary", "fluid"]);
    if (!allowedGenders.has(aiGender)) {
      return new NextResponse("Invalid AI gender", { status: 400 });
    }

    const aiIdentity = await prisma.aIIdentity.upsert({
      where: { ownerId: userId },
      update: {
        aiName,
        aiAge: parsedAge,
        aiGender,
        isPublic: isPublic === "true" || isPublic === true,
        location: location || null,
        phoneNumber: phoneNumber || null,
      },
      create: {
        ownerId: userId,
        aiName,
        aiAge: parsedAge,
        aiGender,
        isPublic: isPublic === "true" || isPublic === true,
        location: location || null,
        phoneNumber: phoneNumber || null,
      },
    });

    return NextResponse.json(aiIdentity);
  } catch (error) {
    console.error("AI_IDENTITY_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
