import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const requestData = await req.formData()
    const socketId = requestData.get('socket_id') as string

    if(!socketId) {
      return NextResponse.json({}, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        isOnline: true,
        friendIds: true
      }
    })

    if(!user) {
      return NextResponse.json({}, { status: 401 })
    }

    const authResponse = pusherServer.authenticateUser(socketId, {
      id: user.id,
      user_info:{
        name: user.name,
        isOnline: false
      },
      watchlist: user.friendIds
    })

    return NextResponse.json(authResponse, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
