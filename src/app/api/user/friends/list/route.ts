import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Friend } from "@/types/models";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        friendIds: true
      }
    })

    if (!user) {
      return NextResponse.json({}, { status: 401 })
    }

    const userFriends: Friend[] = await prisma.user.findMany({
      where: {
        id: { in: user.friendIds }
      },
      select: {
        id: true,
        name: true,
        bio: true,
        isOnline: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(userFriends, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
