import prisma from "@/lib/prisma";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = await new MongoClient(process.env.DATABASE_URL!).connect();
  }

  return cachedClient;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const { code, id } = await req.json()

    if(!code || !id) {
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
        id: true,
        userId: true,
        role: true
      }
    })
    
    if(!serverProfile) {
      return NextResponse.json({}, { status: 401 })
    }

    const fileData = await prisma.file.findUnique({
      where: {
        id: id
      },
      select: {
        senderId: true,
        gridId: true
      }
    })

    if(!fileData) {
      return NextResponse.json({}, { status: 404 })
    }

    if((fileData.senderId !== serverProfile.userId && serverProfile.role === "MEMBER")) {
      return NextResponse.json({}, { status: 401 })
    }

    const url = process.env.DATABASE_URL?.split('/')
    if(!url) {
      return NextResponse.json({}, { status: 403 })
    }

    const mongoClient = await getMongoClient()
    const db = mongoClient.db(url[url.length - 1])
    const bucket = new GridFSBucket(db)

    await bucket.delete(new ObjectId(fileData.gridId), { timeoutMS: 5000 })

    await prisma.file.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
