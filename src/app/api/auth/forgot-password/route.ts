import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import {
  createPasswordResetToken,
  getPasswordResetUrl,
} from "@/lib/password-reset";
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_MESSAGE =
  "If an account exists for that email, we sent password reset instructions.";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`forgot-password:${ip}`, {
      limit: 5,
      windowMs: 15 * 60_000,
    });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: buildRateLimitHeaders(rate) },
      );
    }

    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    let devResetUrl: string | undefined;

    if (user) {
      const { token, tokenHash, expiresAt } = createPasswordResetToken();

      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const resetUrl = getPasswordResetUrl(token);
      const mailResult = await sendPasswordResetEmail(email, resetUrl);

      if (!mailResult.sent) {
        devResetUrl = resetUrl;
      }
    }

    return NextResponse.json({
      message: GENERIC_MESSAGE,
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
