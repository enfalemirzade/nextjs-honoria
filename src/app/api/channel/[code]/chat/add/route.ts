import prisma from "@/lib/prisma";
import CryptoJS from 'crypto-js';
import { getServerSession } from "next-auth";
import { triggerPusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Message } from "@/types/models";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { code, content } = await req.json()

    if(!code || !content) {
      return NextResponse.json({}, { status: 403 })
    }

    const serverProfile = await prisma.serverMember.findFirst({
      where: {
        server: {
          code
        },
        userId: session.user.id,
        isBanned: false
      },
      select: {
        id: true
      }
    })
    
    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }

    const channel = await prisma.server.findUnique({
      where: {
        code
      },
      select: {
        id: true
      }
    })

    if(!channel) {
      return NextResponse.json({}, { status: 404 })
    }

    const encryptedContent = CryptoJS.AES.encrypt(content, process.env.CRYPTO_SECRET!).toString()

    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        serverId: channel.id,
        senderId: session.user.id
      }
    })

    const response: Message = {
      id: message.id,
      content: content,
      senderId: message.senderId,
      sender: {
        name: session.user.name
      },
      server: {
        code: code
      }
    }

    await triggerPusher(`presence-channel-${code}`, "add-message", response)

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
