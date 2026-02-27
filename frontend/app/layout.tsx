import type { Metadata } from "next"
import "./globals.css"
import AuthLoader from "@/components/AuthLoader"

export const metadata: Metadata = {
  title: "RadioPlatform",
  description: "Global live radio discovery",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthLoader />
        {children}
      </body>
    </html>
  )
}