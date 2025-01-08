import prisma from "@/lib/prisma";
import { Server, User } from "@/types/models";
import { triggerPusher } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { code } = await req.json()

    if(!code ) {
      return NextResponse.json({}, { status: 400 })
    }

    const server = await prisma.server.findUnique({
      where: {
        code: code
      },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        createdAt: true,
        members: {
          where: {
            userId: session.user.id
          },
          select: {
            isBanned: true
          }
        }
      }
    })

    if(!server) {
      return NextResponse.json({}, { status: 404 })
    }

    if(server.members.length > 0) {
      return NextResponse.json({}, { status: 409 })
    }

    if(server.isPrivate || server.members.some(member => member.isBanned)) {
      return NextResponse.json({}, { status: 401 })
    }

    const [serverMember, anyInvite] = await prisma.$transaction([
      prisma.serverMember.create({
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
        }
      }),
      prisma.notice.findFirst({
        where: {
          receiverId: session.user.id,
          isAnswered: false,
          serverCode: code
        },
        select: {
          id: true
        }
      })
    ])

    if(anyInvite) {
      await prisma.notice.update({
        where: {
          id: anyInvite.id
        },
        data: {
          isAnswered: true
        }
      })
    }

    const responseData: Server = {
      role: serverMember.role,
      server: {
        id: server.id,
        name: server.name,
        code: code,
        isPrivate: server.isPrivate,
        createdAt: server.createdAt
      }
    }

    const triggerData: User = {
      id: serverMember.userId,
      role: serverMember.role,
      isOnline: false,
      name: serverMember.user.name,
      bio: serverMember.user.bio
    }

    await triggerPusher(`presence-channel-${code}`, "add-user", triggerData)

    return NextResponse.json({server: responseData, noticeId: anyInvite?.id}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
