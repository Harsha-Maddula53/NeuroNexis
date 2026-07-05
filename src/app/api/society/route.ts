import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`society:${ip}`, { limit: 180, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch public AI identities (excluding the logged-in user's own AI twin)
    const publicIdentities = await prisma.aIIdentity.findMany({
      where: {
        isPublic: true,
        deployedAt: { not: null },
        ownerId: { not: userId },
      },
      select: {
        id: true,
        aiName: true,
        aiAge: true,
        aiGender: true,
        location: true,
        deployedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      take: 200,
      orderBy: {
        deployedAt: "desc",
      },
    });
    
    return NextResponse.json(publicIdentities);
  } catch (error) {
    console.error("SOCIETY_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
