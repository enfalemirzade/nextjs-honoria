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

    const { name, type } = await req.json()

    if(!name || !type) {
      return NextResponse.json({}, { status: 400 })
    }
  
    const targetUser = await prisma.user.findUnique({
      where: {
        name: name,
      },
      select: {
        id: true,
        friendIds: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json({}, { status: 404 })
    }

    const notice = await prisma.notice.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: targetUser.id,
        isAnswered: false,
        type: type
      },
      select: {
        id: true
      }
    })

    if (session.user.id === targetUser.id || targetUser.friendIds.includes(session.user.id) || notice) {
      return NextResponse.json({}, { status: 400 })
    }

    const newNotice: Notice = await prisma.notice.create({
      data: {
        receiverId: targetUser.id,
        senderId: session.user.id,
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
