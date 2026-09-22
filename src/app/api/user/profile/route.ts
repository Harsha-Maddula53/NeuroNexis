import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const rate = await checkRateLimit(`user:profile:${userId}`, { limit: 30, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many profile updates. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const profilePhoto = body.profilePhoto;

    if (!name || !email) {
      return new NextResponse("Name and email are required", { status: 400 });
    }

    if (name.length > 120) {
      return new NextResponse("Name is too long", { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    const existingWithEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingWithEmail && existingWithEmail.id !== userId) {
      return new NextResponse("Email is already in use", { status: 409 });
    }

    const updateData: { name: string; email: string; profilePhoto?: string | null } = { name, email };
    if (profilePhoto !== undefined) {
      updateData.profilePhoto = typeof profilePhoto === "string" ? profilePhoto : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Return both success and updated user data
    // The client should call update() on useSession() after receiving this
    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
