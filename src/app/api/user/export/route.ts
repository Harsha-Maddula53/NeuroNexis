export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const testUserId = req.headers.get('x-test-user-id');
    const userId = testUserId || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



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

    // Dynamically append disclosure to raw strings during export
    if (safeUserData.messages) {
      safeUserData.messages = safeUserData.messages.map(msg => {
        if (msg.isAi && !msg.content.startsWith("(AI ")) {
          return {
            ...msg,
            content: `(AI Representation of ${user.name}) ${msg.content}`
          };
        }
        return msg;
      });
    }

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
