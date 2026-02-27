import { create } from "zustand"

interface User {
  token: string
  username: string
  email: string
}

interface AuthStore {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,

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