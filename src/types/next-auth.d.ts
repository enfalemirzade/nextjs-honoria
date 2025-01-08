/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string
    name: string
  }

  interface Session {
    user: {
      id: string
      name: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
