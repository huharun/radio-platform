import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "RadioPlatform",
  description: "Global live radio discovery",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}