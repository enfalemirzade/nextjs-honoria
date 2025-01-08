import prisma from "@/lib/prisma";
import { triggerPusher } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Notice } from "@/types/models";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { id, serverCode, type } = await req.json()

    if(!id || !serverCode || !type) {
      return NextResponse.json({}, { status: 400 })
    }

    const [targetUser, server] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          servers: {
            select: {
              serverId: true,
              isBanned: true
            }
          }
        }
      }),
      prisma.server.findUnique({
        where: {
          code: serverCode
        },
        select: {
          id: true,
          isPrivate: true,
          members: {
            where: {
              userId: session.user.id,
              role: {
                in: ["OWNER", "ADMIN"]
              }
            },
            select: {
              id: true
            }
          }
        }
      })
    ])

    if(!targetUser || !server) {
      return NextResponse.json({}, { status: 404 })
    }

    if(server.isPrivate && !server.members.length) {
      return NextResponse.json({}, { status: 401 })
    }

    if(targetUser.servers.find((userServer) => userServer.serverId === server.id || userServer.isBanned)) {
      return NextResponse.json({}, { status: 403 })
    }

    if (session.user.id === targetUser.id) {
      return NextResponse.json({}, { status: 400 })
    }

    const existingNotice = await prisma.notice.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: targetUser.id,
        serverCode: serverCode,
        isAnswered: false,
        type: type
      }
    })

    if(existingNotice) {
      return NextResponse.json({}, { status: 400 })
    }

    const newNotice: Notice = await prisma.notice.create({
      data: {
        receiverId: targetUser.id,
        senderId: session.user.id,
        serverCode: serverCode,
        type: type
      },
      select: {
        id: true,
        senderId: true,
        type: true,
        serverCode: true,
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    await triggerPusher(`private-user-${targetUser.id}`, "add-notice", newNotice)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
