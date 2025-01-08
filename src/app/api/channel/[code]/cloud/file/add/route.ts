import prisma from "@/lib/prisma";
import CryptoJS from 'crypto-js';
import crypto from "crypto";
import { MongoClient, GridFSBucket } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 100 * 1024 * 1024
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "video/mp4",
  "audio/mp3",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

let cachedClient: MongoClient | null = null

async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = await new MongoClient(process.env.DATABASE_URL!).connect()
  }

  return cachedClient
}

function encryptFile(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(16)
  const key = Buffer.from(process.env.CRYPTO_SECRET!, 'base64')
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  return Buffer.concat([iv, encrypted])
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({}, { status: 401 })
    }

    const formData = await req.formData()
    const folderId = formData.get('folderId')?.toString()
    const code = formData.get('code')?.toString()

    if(!code || !folderId) {
      return NextResponse.json({}, { status: 403 })
    }

    const files = formData.getAll('files') as File[]

    if(!files.length) {
      return NextResponse.json({}, { status: 400 })
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({}, { status: 400 })
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({}, { status: 400 })
      }
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

    const url = process.env.DATABASE_URL?.split('/')
    if(!url) {
      return NextResponse.json({}, { status: 403 })
    }

    const mongoClient = await getMongoClient()
    const db = mongoClient.db(url[url.length - 1])
    const bucket = new GridFSBucket(db)

    const uploadPromises = files.map(async (file) => {
      const fileBuffer = await file.arrayBuffer()
      const encryptedBuffer = encryptFile(Buffer.from(fileBuffer))
      const encryptedFileName = CryptoJS.AES.encrypt(file.name, process.env.CRYPTO_SECRET!).toString()
  
      const uploadStream = bucket.openUploadStream(encryptedFileName, {
        contentType: file.type,
        metadata: {
          senderId: session.user.id,
          folderId
        }
      })
  
      uploadStream.end(encryptedBuffer)
  
      return new Promise<void>((resolve, reject) => {
        uploadStream.on('finish', async () => {
          try {
            await prisma.file.create({
              data: {
                gridId: uploadStream.id.toString(),
                name: file.name,
                type: file.type,
                size: file.size,
                folderId,
                senderId: session.user.id
              }
            })

            resolve()
          } catch (err) {
            reject(err)
          }
        })
  
        uploadStream.on('error', (err) => {
          reject(err)
        })
      })
    })

    await Promise.all(uploadPromises)

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
