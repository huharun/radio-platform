"use client"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth(s => s.hydrate)
  useEffect(() => { hydrate() }, [hydrate])
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}