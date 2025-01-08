import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Folder } from "@/types/models";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { code, name } = await req.json()

    if(!code || !name) {
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

    const isNameExist = await prisma.folder.findUnique({
      where: {
        name: name,
        serverId: channel.id
      },
      select: {
        id: true
      }
    })

    if(isNameExist) {
      return NextResponse.json({}, { status: 403 })
    }

    const folder: Folder = await prisma.folder.create({
      data: {
        name: name,
        serverId: channel.id,
      },
      select: {
        id: true,
        name: true,
        files: true
      }
    })

    return NextResponse.json(folder, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
