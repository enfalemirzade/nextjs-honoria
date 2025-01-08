import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Notice } from "@/types/models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const userNotices: Notice[] = await prisma.notice.findMany({
      where: {
        receiverId: session.user.id,
        isAnswered: false
      },
      select: {
        id: true,
        senderId: true,
        serverCode: true,
        type: true,
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        sendedAt: 'desc'
      }
    })

    if (!userNotices) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json(userNotices, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
