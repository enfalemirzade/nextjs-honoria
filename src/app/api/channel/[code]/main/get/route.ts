import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Channel } from "@/types/models";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const code = req.url.split("/")[5]

    if(!code) {
      return NextResponse.json({}, { status: 403 })
    }

    const serverProfile = await prisma.serverMember.findFirst({
      where: {
        server: {
          code
        },
        userId: session.user.id,
        isBanned: false,
      },
      select: {
        id: true
      }
    })
    
    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }

    const channel: Channel | null = await prisma.server.findUnique({
      where: {
        code
      },
      select: {
        id: true,
        name: true,
        code: true,
        isPrivate: true
      }
    })

    if (!channel) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json(channel, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
