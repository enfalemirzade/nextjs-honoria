import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Server } from "@/types/models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const serverMembers: Server[] = await prisma.serverMember.findMany({
      where: {
        userId: session.user.id,
        isBanned: false
      },
      select: {
        role: true,
        server: {
          select: {
            id: true,
            name: true,
            isPrivate: true,
            createdAt: true,
            code: true
          }
        }
      },
      orderBy: {
        server: {
          createdAt: "desc"
        }
      }
    })

    return NextResponse.json(serverMembers, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
