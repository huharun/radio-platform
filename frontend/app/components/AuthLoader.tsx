"use client"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth"

export default function AuthLoader() {
  const { setUser } = useAuth()

  useEffect(() => {
    const saved = localStorage.getItem("radio_user")
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
  }, [])

  return null
}