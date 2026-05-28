export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        aiIdentity: true,
        behaviorProfile: true,
        messages: {
          take: 1000,
          orderBy: { timestamp: 'desc' }
        },
        feedbacks: true,
        sentConnections: true,
        receivedConnections: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strip sensitive info like password
    const { password, ...safeUserData } = user;

    // Return as a downloadable JSON file
    return new NextResponse(JSON.stringify(safeUserData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="NeuroNexis_Export_${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Export data error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
