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
    const channel = requestData.get('channel_name') as string
    const channelType = channel.split('-')[1]
    const channelId = channel.split('-')[2]

    if(!socketId || !channel || !channelType || !channelId) {
      return NextResponse.json({}, { status: 400 })
    }

    if (channelType !== "user" && channelType !== "channel") {
      return NextResponse.json({}, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        servers: {
          where: {
            isBanned: false,
            server: {
              code: channelId
            }
          },
          select: {
            id: true
          }
        }
      }
    })

    if(!user) {
      return NextResponse.json({}, { status: 401 })
    }

    if(channelType === "channel" && !user.servers.length) {
      return NextResponse.json({}, { status: 401 })
    }

    else if (channelType === "user" && user.id !== channelId) {
      return NextResponse.json({}, { status: 401 })
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel)

    return NextResponse.json(authResponse, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
