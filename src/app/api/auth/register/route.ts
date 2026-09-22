import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = await checkRateLimit(`register:${ip}`, { limit: 8, windowMs: 10 * 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    let body: Record<string, FormDataEntryValue | string>;
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const dob = String(body.dob ?? "").trim();
    const gender = String(body.gender ?? "").trim();

    if (!firstName || !lastName || !email || !password || !dob || !gender) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (firstName.length > 80 || lastName.length > 80) {
      return new NextResponse("Name is too long", { status: 400 });
    }

    if (password.length < 8 || password.length > 128) {
      return new NextResponse("Password must be 8-128 characters", { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    if (password !== confirmPassword) {
      return new NextResponse("Passwords do not match", { status: 400 });
    }

    const parsedDob = new Date(dob);
    if (Number.isNaN(parsedDob.getTime())) {
      return new NextResponse("Invalid date of birth", { status: 400 });
    }

    const now = new Date();
    let age = now.getUTCFullYear() - parsedDob.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - parsedDob.getUTCMonth();
    const dayDiff = now.getUTCDate() - parsedDob.getUTCDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    if (age < 18) {
      return new NextResponse("You must be at least 18 years old", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        dateOfBirth: parsedDob,
        gender,
      },
    });

    if (!contentType?.includes("application/json")) {
      return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTRATION_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
