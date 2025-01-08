import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Server } from "@/types/models";
import { isBoolean } from "lodash";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { name, isPrivate } = await req.json()

    if(!name || !isBoolean(isPrivate) ) {
      return NextResponse.json({}, { status: 400 })
    }

    let uniqueCode = null
    let isUnique = false
  
    while (!isUnique) {
      uniqueCode = Math.floor(10000 + Math.random() * 90000).toString()

      const existingServer = await prisma.server.findUnique({
        where: {
          code: uniqueCode
        }
      })
  
      if (!existingServer) {
        isUnique = true
      }
    }

    if(!uniqueCode) {
      return NextResponse.json({}, { status: 500 })
    }

    const server = await prisma.server.create({
      data: {
        name: name,
        code: uniqueCode,
        ownerId: session.user.id,
        isPrivate: isPrivate
      }
    })

    if(!server) {
      return NextResponse.json({}, { status: 500 })
    }

    const serverMember: Server = await prisma.serverMember.create({
      data: {
        userId: session.user.id,
        serverId: server.id,
        role: "OWNER"
      },
      select: {
        role: true,
        server: {
          select: {
            id: true,
            name: true,
            code: true,
            isPrivate: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(serverMember, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
