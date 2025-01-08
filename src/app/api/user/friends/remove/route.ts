import prisma from "@/lib/prisma";
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

    const { id } = await req.json()

    if(!id) {
      return NextResponse.json({}, { status: 400 })
    }

    const [user, targetUser] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          id: session.user.id
        },
        select: {
          id: true,
          friendIds: true
        }
      }),
      prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          friendIds: true
        }
      })
    ])

    if(!user) {
      return NextResponse.json({}, { status: 401 })
    }

    if (!user.friendIds.includes(id) || !targetUser) {
      return NextResponse.json({}, { status: 404 })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          friendIds: {
            set: user.friendIds.filter(friendId => friendId !== targetUser.id)
          }
        }
      }),
      prisma.user.update({
        where: {
          id: targetUser.id
        },
        data: {
          friendIds: {
            set: targetUser.friendIds.filter(friendId => friendId !== user.id)
          }
        }
      })
    ])

    await triggerPusher(`private-user-${targetUser.id}`, "remove-friend", user.id)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
