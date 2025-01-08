import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error()
        }

        const user = await prisma.user.findUnique({
          where: { 
            name: credentials.name
          },
          select: { 
            id: true,
            name: true,
            password: true
          }
        })

        if (user && await compare(credentials.password, user.password)) {
          return {
            id: user.id,
            name: user.name
          }
        } else {
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string
        }
      }

      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 6 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET
}
