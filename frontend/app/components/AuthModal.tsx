"use client"
import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { login, register } from "@/lib/api"

interface Props { onClose: () => void }

export default function AuthModal({ onClose }: Props) {
  const { setUser } = useAuth()
  const [mode, setMode]       = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = mode === "login"
        ? await login(email, password)
        : await register(username, email, password)
      setUser(data)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass" onClick={e => e.stopPropagation()}>
        <div className="modal-tabs">
          <button className={`modal-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
          <button className={`modal-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Register</button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          {mode === "register" && (
            <input className="search-input" placeholder="Username" value={username}
              onChange={e => setUsername(e.target.value)} required />
          )}
          <input className="search-input" placeholder="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="search-input" placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required />

          {error && <div className="modal-error">{error}</div>}

          <button className="search-btn modal-submit" type="submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}