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

    const { id } = await req.json()

    if(!id) {
      return NextResponse.json({}, { status: 400 })
    }

    const serverMember = await prisma.serverMember.findFirst({
      where: {
        serverId: id,
        userId: session.user.id
      },
      select: {
        id: true,
        userId: true,
        server: {
          select: {
            code: true
          }
        }
      }
    })

    if(!serverMember) return NextResponse.json({}, { status: 404 })

    await prisma.serverMember.delete({
      where: {
        id: serverMember.id
      }
    })

    await triggerPusher(`presence-channel-${serverMember.server.code}`, "remove-user", serverMember.userId)

    return NextResponse.json(serverMember.id, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
