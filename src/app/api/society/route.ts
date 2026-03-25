import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Fetch public AI identities
    const publicIdentities = await prisma.aIIdentity.findMany({
      where: {
        isPublic: true,
        deployedAt: { not: null },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        deployedAt: "desc",
      },
    });

    // In a real app, we'd check connection status here
    // For now, we'll return the identities and handle connection UI on frontend or via another API
    
    return NextResponse.json(publicIdentities);
  } catch (error) {
    console.error("SOCIETY_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
