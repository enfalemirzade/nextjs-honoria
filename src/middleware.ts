import { withAuth } from "next-auth/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "900 s"),
  analytics: true
})

export default withAuth(
  async function middleware(req: Request) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"

    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json({}, { status: 429 })
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login"
    }
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signup).*)']
}
