import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { triggerPusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { Profile } from "@/types/models";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { bio } = await req.json()

    if(!bio) {
      return NextResponse.json({}, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name:true,
        bio: true,
        friendIds: true
      }
    })

    if(!user) {
      return NextResponse.json({}, { status: 401 })
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        bio: bio
      }
    })

    const responseData: Profile = {
      id: user.id,
      name: user.name,
      bio: bio
    }

    for(const friendId of user.friendIds) {
      await triggerPusher(`private-user-${friendId}`, "update-friend", {id: user.id, bio: bio})
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
