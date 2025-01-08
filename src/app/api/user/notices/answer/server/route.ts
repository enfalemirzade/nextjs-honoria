import prisma from "@/lib/prisma";
import { Server, User } from "@/types/models";
import { getServerSession } from "next-auth";
import { triggerPusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isBoolean } from "lodash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { noticeId, id, type, answer, serverCode } = await req.json()

    if(!noticeId || !id || !type || !isBoolean(answer) || !serverCode) {
      return NextResponse.json({}, { status: 400 })
    }

    const [server, notice] = await prisma.$transaction([
      prisma.server.findUnique({
        where: {
          code: serverCode
        },
        select: {
          id: true,
          members: {
            where: {
              userId: session.user.id
            },
            select: {
              id:true
            }
          } 
        }
      }),
      prisma.notice.findUnique({
        where: {
          id: noticeId
        },
        select: {
          id: true
        }
      })
    ])

    if (!notice || !server) {
      return NextResponse.json({}, { status: 404 })
    }
    
    if(!answer) {
      await prisma.notice.update({
        where: {
          id: noticeId
        },
        data: {
          isAnswered: true
        }
      })

      return NextResponse.json({}, { status: 200 })
    }

    if(server.members.length > 0) {
      return NextResponse.json({}, { status: 409 })
    }

    const serverMember = await prisma.serverMember.create({
      data: {
        userId: session.user.id,
        serverId: server.id,
        role: "MEMBER"
      },
      select: {
        userId: true,
        role: true,
        user: {
          select: {
            name: true,
            bio: true
          }
        },
        server: {
          select:{
            id: true,
            name: true,
            isPrivate: true,
            code: true,
            createdAt: true
          }
        }
      }
    })

    await prisma.notice.update({
      where: {
        id: noticeId
      },
      data: {
        isAnswered: true
      }
    })

    const responseData: Server = {
      role: serverMember.role,
      server: {
        id: serverMember.server.id,
        name: serverMember.server.name,
        code: serverMember.server.code,
        isPrivate: serverMember.server.isPrivate,
        createdAt: serverMember.server.createdAt
      }
    }

    const triggerData: User = {
      id: serverMember.userId,
      role: serverMember.role,
      isOnline: false,
      name: serverMember.user.name,
      bio: serverMember.user.bio
    }

    await triggerPusher(`presence-channel-${serverMember.server.code}`, "add-user", triggerData)

    return NextResponse.json(responseData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
