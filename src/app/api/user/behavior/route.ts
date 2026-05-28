import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

function normalizeText(value: unknown, maxLength = 120): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const getRate = checkRateLimit(`user:behavior:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!getRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(getRate),
        },
      );
    }

    const behaviorProfile = await prisma.behaviorProfile.findUnique({
      where: { ownerId: userId },
    });

    return NextResponse.json(behaviorProfile);
  } catch (error) {
    console.error("BEHAVIOR_GET_ERROR:", error);
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
    const postRate = checkRateLimit(`user:behavior:post:${userId}`, { limit: 20, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many behavior updates. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

    const body = await req.json();

    const profession = normalizeText(body.profession, 120);
    const tone = normalizeText(body.tone, 60);
    const humorLevel = normalizeText(body.humorLevel, 40);
    const responseLength = normalizeText(body.responseLength, 40);
    const emotionalSensitivity = normalizeText(body.emotionalSensitivity, 40);
    const languages = normalizeText(body.languages, 120);
    const disagreementStyle = normalizeText(body.disagreementStyle, 40);
    const ambition = normalizeText(body.ambition, 120);
    const maritalStatus = normalizeText(body.maritalStatus, 60);
    const identityTransparency = normalizeText(body.identityTransparency, 40);
    const mood = normalizeText(body.mood || "Professional", 60);

    if (
      !profession ||
      !tone ||
      !humorLevel ||
      !responseLength ||
      !emotionalSensitivity ||
      !languages ||
      !disagreementStyle ||
      !ambition ||
      !maritalStatus ||
      !identityTransparency
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const allowedTones = new Set(["Casual", "Formal", "Professional", "Friendly"]);
    const allowedHumor = new Set(["None", "Light", "Moderate", "Frequent"]);
    const allowedResponseLength = new Set(["Short", "Medium", "Detailed"]);
    const allowedSensitivity = new Set(["Low", "Medium", "High"]);
    const allowedDisagreement = new Set(["Diplomatic", "Assertive", "Avoidant"]);
    const allowedTransparency = new Set(["Always", "Often", "Rarely", "Never"]);

    if (!allowedTones.has(tone)) {
      return new NextResponse("Invalid tone", { status: 400 });
    }

    if (!allowedHumor.has(humorLevel)) {
      return new NextResponse("Invalid humor level", { status: 400 });
    }

    if (!allowedResponseLength.has(responseLength)) {
      return new NextResponse("Invalid response length", { status: 400 });
    }

    if (!allowedSensitivity.has(emotionalSensitivity)) {
      return new NextResponse("Invalid emotional sensitivity", { status: 400 });
    }

    if (!allowedDisagreement.has(disagreementStyle)) {
      return new NextResponse("Invalid disagreement style", { status: 400 });
    }

    if (!allowedTransparency.has(identityTransparency)) {
      return new NextResponse("Invalid identity transparency", { status: 400 });
    }

    const behaviorProfile = await prisma.behaviorProfile.upsert({
      where: { ownerId: userId },
      update: {
        profession,
        tone,
        humorLevel,
        responseLength,
        emotionalSensitivity,
        languages,
        disagreementStyle,
        ambition,
        maritalStatus,
        identityTransparency,
        mood,
      },
      create: {
        ownerId: userId,
        profession,
        tone,
        humorLevel,
        responseLength,
        emotionalSensitivity,
        languages,
        disagreementStyle,
        ambition,
        maritalStatus,
        identityTransparency,
        mood,
      },
    });

    return NextResponse.json(behaviorProfile);
  } catch (error) {
    console.error("BEHAVIOR_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
