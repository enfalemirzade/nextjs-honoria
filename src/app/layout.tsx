import AuthContext from "@/context/AuthContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Honoria",
  description: "Nextjs serverless social platform project"
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
