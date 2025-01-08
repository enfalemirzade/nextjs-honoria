import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { title, content, password } = await req.json()

    if(!title || !content || !password ) {
      return NextResponse.json({}, { status: 400 })
    }

    if(password !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({}, { status: 401 })
    }

    await prisma.blog.create({
      data: {
        title,
        content,        
      }
    })

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
