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
          role: "OWNER"
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
          isBanned: false,
        },
        select: {
          id: true,
          user: {
            select: {
              name: true
            }
          },
          userId: true,
          role: true
        }
      })
    ])

    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }
    
    if(!serverMember) {
      return NextResponse.json({}, { status: 404 })
    }

    const role = serverMember.role === "MEMBER" ? "ADMIN" : serverMember.role === "ADMIN" ? "MEMBER" : null

    if(!role) {
      return NextResponse.json({}, { status: 403 })
    }

    await prisma.$transaction([
      prisma.serverMember.update({
        where: {
          id: serverMember.id
        },
        data: {
          role: role
        }
      }),
      prisma.log.create({
        data: {
          content: `${serverMember.user.name}'s role is changed by ${serverProfile.user.name}`,
          serverId: serverProfile.server.id
        }
      })
    ])

    const updatedUser = {
      id: serverMember.userId,
      role: role,
    }

    await triggerPusher(`presence-channel-${code}`, "update-user", updatedUser)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
