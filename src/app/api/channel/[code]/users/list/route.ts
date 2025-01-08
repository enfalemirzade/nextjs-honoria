import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { User } from "@/types/models";

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

    const serverMembers = await prisma.serverMember.findMany({
      where: {
        isBanned: false,
        server: {
          code: code
        }
      },
      select: {
        userId: true,
        role: true,
        user: {
          select: {
            name: true,
            bio: true,
            isOnline: true
          }
        }
      },
      orderBy: [
        {
          role: 'desc'
        },
        {
          user: {
            name: 'asc'
          }
        }
      ]
    })

    if (!serverMembers) {
      return NextResponse.json({}, { status: 404 })
    }

    const resData: User[] = serverMembers.map(member => ({
      id: member.userId,
      role: member.role,
      name: member.user.name,
      isOnline: member.user.isOnline,
      bio: member.user.bio
    }))

    return NextResponse.json(resData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
