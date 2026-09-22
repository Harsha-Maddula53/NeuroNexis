import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const action = formData.get("action");

    if (action !== "reviewed" && action !== "dismissed") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.report.update({
      where: { id: params.id },
      data: { status: action },
    });

    // Since we used a form submission, redirect back
    return NextResponse.redirect(new URL("/admin/reports", req.url), 303);
  } catch (error) {
    console.error("[admin-report-action]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
