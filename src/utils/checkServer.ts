import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function checkServer(code: string): Promise<{state: boolean, userId: string | null}> {
  const session = await getServerSession(authOptions)

  try {
    if (!session || !code) {
      return {state: false, userId: null}
    }
    
    const serverMember = await prisma.serverMember.findFirst({
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

    return {state: !!serverMember, userId: session.user.id}
  } catch (err) {
    console.error(err)
    return {state: false, userId: null}
  }
}
