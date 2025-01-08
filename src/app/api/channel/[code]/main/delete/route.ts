import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { triggerPusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { code } = await req.json()

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
        role: "OWNER"
      },
      select: {
        id: true
      }
    })
    
    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }

    const channel = await prisma.server.findUnique({
      where: {
        code
      },
      select: {
        id: true
      }
    })

    if(!channel) {
      return NextResponse.json({}, { status: 404 })
    }

    await prisma.server.delete({
      where: {
        id: channel.id
      }
    })

    await triggerPusher(`presence-channel-${code}`, "remove-user", "ALL")

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
