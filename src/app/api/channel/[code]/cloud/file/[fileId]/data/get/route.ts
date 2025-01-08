import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const code = req.url.split("/")[5]
    const fileId = req.url.split("/")[8]

    if(!code || !fileId) {
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

    const fileMeta = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        type: true,
        name: true,
        size: true,
        createdAt: true,
        sender: {
          select: {
            name: true
          }
        }
      }
    })

    if (!fileMeta) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json(fileMeta, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
