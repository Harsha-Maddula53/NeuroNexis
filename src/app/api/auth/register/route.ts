import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let body;
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      body = await req.json();
    } else {
      // Handle form data (from standard HTML form)
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { firstName, lastName, email, password, confirmPassword, dob, gender } = body;
    console.log("Registration attempt:", { email, firstName, lastName, dob, gender });

    // Validation
    if (!firstName || !lastName || !email || !password || !dob || !gender) {
      console.error("Missing required fields");
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new NextResponse("Invalid email format", { status: 400 });
    }

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return new NextResponse("Passwords do not match", { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("User already exists:", email);
      return new NextResponse("User already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log("Creating user in Prisma...");
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dob),
        gender,
      },
    });
    console.log("User created successfully:", user.id);

    // For plain HTML form submissions, we should ideally redirect
    if (!contentType?.includes("application/json")) {
      return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    }, { status: 201 });

  } catch (error: any) {
    console.error("REGISTRATION_ERROR_DETAIL:", error);
    if (error.code) console.error("Prisma Error Code:", error.code);
    if (error.meta) console.error("Prisma Error Meta:", error.meta);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
