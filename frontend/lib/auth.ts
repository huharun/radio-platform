import { create } from "zustand"

interface User { token: string; username: string; email: string }
interface AuthStore {
  user: User | null
  mounted: boolean
  setUser: (u: User | null) => void
  logout: () => void
  hydrate: () => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  mounted: false,
  hydrate: () => {
    try {
      const stored = localStorage.getItem("radio_user")
      set({ user: stored ? JSON.parse(stored) : null, mounted: true })
    } catch {
      set({ user: null, mounted: true })
    }
  },
  setUser: (u) => {
    if (u) localStorage.setItem("radio_user", JSON.stringify(u))
    else localStorage.removeItem("radio_user")
    set({ user: u })
  },
  logout: () => {
    localStorage.removeItem("radio_user")
    set({ user: null })
  }
}))