import prisma from "@/lib/prisma";
import { sendToUser, triggerPusher } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Friend } from "@/types/models";
import { isBoolean } from "lodash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { noticeId, id, answer } = await req.json()

    if(!noticeId || !id || !isBoolean(answer) ) {
      return NextResponse.json({}, { status: 400 })
    }

    const [user, targetUser, notice] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          id: session.user.id
        },
        select: {
          id: true,
          name:true,
          bio: true,
          isOnline: true,
          friendIds: true,
        }
      }),
      prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          name:true,
          bio: true,
          isOnline: true,
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

    if (!user) {
      return NextResponse.json({}, { status: 401 })
    }

    if (!targetUser || !notice) {
      return NextResponse.json({}, { status: 404 })
    }

    if (user.friendIds.includes(targetUser.id)) {
      return NextResponse.json({}, { status: 400 })
    }
    
    if(!answer) {
      await prisma.notice.update({
        where: {
          id: notice.id
        },
        data: {
          isAnswered: true
        }
      })

      return NextResponse.json({}, { status: 200 })
    }

    const reciprocalNotice = await prisma.notice.findFirst({
      where: {
        senderId: user.id,
        receiverId: targetUser.id,
        isAnswered: false
      }
    })

    await prisma.$transaction([
      prisma.notice.update({
        where: {
          id: noticeId
        },
        data: {
          isAnswered: true
        }
      }),
      ...(reciprocalNotice ? [
        prisma.notice.update({
          where: {
            id: reciprocalNotice.id
          },
          data: {
            isAnswered: true
          }
        })]: []
      ),
      prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          friendIds: {
            push: targetUser.id
          }
        }
      }),
      prisma.user.update({
        where: {
          id: targetUser.id
        },
        data: {
          friendIds: {
            push: user.id
          }
        }
      })
    ])

    const pusherData: Friend = {
      id: user.id,
      name: user.name,
      bio: user.bio,
      isOnline: user.isOnline
    }

    await sendToUser(targetUser.id, "add-friend", {})

    await triggerPusher(`private-user-${targetUser.id}`, "add-friend", {updatedFriend: pusherData, updatedNotice: reciprocalNotice?.id})

    return NextResponse.json(targetUser as Friend, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
