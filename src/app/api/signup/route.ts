import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json()

    if(!name || !password) {
      return NextResponse.json({}, { status: 400 })
    }

    const exists = await prisma.user.findUnique({
      where: {
        name: name
      },
      select: {
        id: true
      }
    })

    if (exists) { 
      return NextResponse.json({}, { status: 409 }) 
    }

    await prisma.user.create({
      data: {
        name,
        password: await hash(password, 12)
      }
    })

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
