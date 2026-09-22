import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = await checkRateLimit(`reset-password:${ip}`, {
      limit: 8,
      windowMs: 15 * 60_000,
    });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: buildRateLimitHeaders(rate) },
      );
    }

    const body = await req.json();
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be 8–128 characters." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await prisma.passwordResetToken.delete({ where: { id: record.id } });
      }
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
