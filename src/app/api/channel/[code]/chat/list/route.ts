import prisma from "@/lib/prisma";
import CryptoJS from 'crypto-js';
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Message } from "@/types/models";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const code = req.url.split("/")[5]

    if(!code) {
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

    const messages: Message[] = await prisma.message.findMany({
      where: {
        serverId: channel.id
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        sender: {
          select: {
            name: true
          }
        },
        server: {
          select: {
            code: true
          }
        }
      },
      take: 100
    })

    const decryptedMessages = await Promise.all(
      messages.map(async (message) => ({
        ...message,
        content: CryptoJS.AES.decrypt(message.content, process.env.CRYPTO_SECRET!).toString(CryptoJS.enc.Utf8)
      }))
    )

    return NextResponse.json(decryptedMessages, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
