import prisma from "@/lib/prisma";
import crypto from "crypto";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (!cachedClient) {
    cachedClient = await new MongoClient(process.env.DATABASE_URL!).connect()
  }

  return cachedClient;
}

function decryptFile(encryptedBuffer: Buffer): Buffer {
  const iv = encryptedBuffer.slice(0, 16)
  const encryptedData = encryptedBuffer.slice(16)

  const key = Buffer.from(process.env.CRYPTO_SECRET!, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
  return decrypted;
}

export async function GET(req: Request) {
  try {
    const code = req.url.split("/")[5]
    const fileId = req.url.split("/")[8]

    if(!code || !fileId) {
      return NextResponse.json({}, { status: 403 })
    }

    const url = process.env.DATABASE_URL?.split('/')
    if(!url) {
      return NextResponse.json({}, { status: 403 })
    }

    const mongoClient = await getMongoClient()
    const db = mongoClient.db(url[url.length - 1])
    const bucket = new GridFSBucket(db)

    const fileMeta = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        id: true,
        gridId: true,
        type: true
      }
    })

    if (!fileMeta) {
      return NextResponse.json({}, { status: 404 })
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileMeta.gridId))

    const chunks: Uint8Array[] = []
    await new Promise((resolve, reject) => {
      downloadStream.on("data", (chunk) => chunks.push(chunk))
      downloadStream.on("end", resolve)
      downloadStream.on("error", reject)
    })

    const buffer = decryptFile(Buffer.concat(chunks))
    return new Response(buffer, {
      headers: {
        "Content-Type": fileMeta.type,
        "Content-Disposition": `inline; filename="${fileMeta.id}"`,
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({}, { status: 500 })
  }
}
