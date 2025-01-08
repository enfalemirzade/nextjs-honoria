import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { triggerPusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { User } from "@/types/models";
import { isBoolean } from "lodash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { id, code } = await req.json() 

    if(!id || !code) {
      return NextResponse.json({}, { status: 403 })
    }

    const [serverProfile, serverMember] = await prisma.$transaction([
      prisma.serverMember.findFirst({
        where: {
          server: {
            code
          },
          userId: session.user.id,
          isBanned: false,
          role: {
            in: ["OWNER", "ADMIN"]
          }
        },
        select: {
          id: true,
          user: {
            select: {
              name: true
            }
          },
          server: {
            select: {
              id: true
            }
          }
        }
      }),
      prisma.serverMember.findFirst({
        where: {
          server: {
            code
          },
          userId: id,
          role: "MEMBER"
        },
        select: {
          id: true,
          userId: true,
          role: true,
          isBanned: true,
          user: {
            select: {
              name: true,
              bio: true,
              isOnline: true
            }
          }
        }
      })
    ])

    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }
    
    if(!serverMember) {
      return NextResponse.json({}, { status: 404 })
    }

    const ban = serverMember.isBanned === true ? false : serverMember.isBanned === false ? true : null

    if(!isBoolean(ban)) {
      return NextResponse.json({}, { status: 403 })
    }

    await prisma.$transaction([
      prisma.serverMember.update({
        where: {
          id: serverMember.id
        },
        data: {
          isBanned: ban
        },
      }),
      prisma.log.create({
        data: {
          content: `${serverMember.user.name} ${ban ? "banned by" : "unbanned by"} ${serverProfile.user.name}`,
          serverId: serverProfile.server.id
        }
      })
    ])

    if(ban === true) {
      await triggerPusher(`presence-channel-${code}`, "remove-user", serverMember.userId)
    }
    else if(ban === false) {
      const user: User = {
        id: serverMember.userId,
        name: serverMember.user.name,
        role: serverMember.role,
        bio: serverMember.user.bio,
        isOnline: serverMember.user.isOnline
      }

      await triggerPusher(`presence-channel-${code}`, "add-user", user)
    }

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
