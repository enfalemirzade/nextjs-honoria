import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

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
        isBanned: false,
        role: {
          in: ["OWNER", "ADMIN"]
        }
      },
      select: {
        id: true
      }
    })
    
    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }

    const bannedMembers = await prisma.serverMember.findMany({
      where: {
        server: {
          code
        },
        isBanned: true
      },
      select: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const resData = bannedMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name
    }))

    return NextResponse.json(resData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
