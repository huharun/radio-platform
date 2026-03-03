"use client"
import { useState, useRef, useEffect } from "react"
import { checkAiHealth, sendChatMessage } from "@/lib/api"

interface Message { role: "user" | "assistant"; content: string; loading?: boolean }

const SUGGESTIONS = ["Find me chill late night jazz", "Best stations for focus", "Recommend world music", "Upbeat morning radio"]

export default function AIChatPanel({ onPlay, onClose, inline = false }: { onPlay: (s: any) => void; onClose?: () => void; inline?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hey! I'm your AI radio guide 🎵 Ask me anything — mood picks, genre recs, or just chat. What are you feeling?" }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [ollamaOk, setOllamaOk] = useState(false)
  const [setupInfo, setSetupInfo] = useState<any>(null)
  const [models, setModels] = useState<string[]>([])
  const [model, setModel] = useState("gemma3:4b")
  const [customModel, setCustomModel] = useState("")
  const [showModels, setShowModels] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAiHealth().then((res: any) => {
      if (res?.available) { setOllamaOk(true); setModels(res.models || []); if (res.models?.length) setModel(res.models[0]) }
      else { setSetupInfo(res?.setup || null) }
      setChecking(false)
    }).catch(() => { setChecking(false) })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const activeModel = customModel.trim() || model

  const send = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput("")
    const userMsg: Message = { role: "user", content }
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "", loading: true }])
    setLoading(true)
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await sendChatMessage(history, activeModel)
      if (res.reply === "__OLLAMA_DOWN__") { setOllamaOk(false); setMessages(prev => prev.slice(0, -1)); setLoading(false); return }
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: res.reply || "No response." }])
    } catch { setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: "Something went wrong." }]) }
    setLoading(false)
  }

  const cls = inline ? "ai-chat-inline" : "ai-chat-floating-panel"

  if (checking) return (
    <div className={cls} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <div className="ai-typing" style={{ justifyContent: "center", marginBottom: 10 }}><span/><span/><span/></div>
        Checking Ollama...
      </div>
    </div>
  )

  if (!ollamaOk) return (
    <div className={cls} style={{ display: "flex", flexDirection: "column" }}>
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <div className="ai-chat-avatar"><svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></div>
          <div><div className="ai-chat-title">Radio AI</div><div className="ai-chat-subtitle" style={{ color: "#ff375f" }}>Ollama not detected</div></div>
        </div>
        {onClose && <button className="ai-chat-close" onClick={onClose}>✕</button>}
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <div style={{ background: "rgba(255,55,95,0.08)", border: "1px solid rgba(255,55,95,0.25)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ff375f", marginBottom: 8 }}>⚠ Ollama is not running</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>This app uses Ollama to run AI locally — free, no API key needed.</div>
        </div>
        {setupInfo?.steps?.map((step: string, i: number) => (
          <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--bg-surface)", border: "1px solid var(--glass-border)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{step}</div>
        ))}
        <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 8, padding: 11, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Download Ollama →</a>
        <button onClick={() => { setChecking(true); checkAiHealth().then((res: any) => { if (res?.available) { setOllamaOk(true); setModels(res.models || []) } setChecking(false) }) }}
          style={{ width: "100%", marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)", background: "var(--bg-surface-2)", color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Retry Connection
        </button>
      </div>
    </div>
  )

  return (
    <div className={cls}>
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <div className="ai-chat-avatar"><svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></div>
          <div>
            <div className="ai-chat-title">Radio AI</div>
            <button onClick={() => setShowModels(p => !p)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 11, cursor: "pointer", padding: 0 }}>{activeModel} ▾</button>
          </div>
        </div>
        {onClose && <button className="ai-chat-close" onClick={onClose}>✕</button>}
      </div>

      {showModels && (
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--glass-border)", background: "var(--bg-surface)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Model</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {models.map(m => (
              <button key={m} onClick={() => { setModel(m); setCustomModel(""); setShowModels(false) }}
                style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${model === m && !customModel ? "var(--accent)" : "var(--glass-border)"}`, background: model === m && !customModel ? "rgba(191,90,242,0.15)" : "var(--bg-surface-2)", color: model === m && !customModel ? "var(--accent)" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {m}
              </button>
            ))}
          </div>
          <input className="ai-chat-input" style={{ fontSize: 12, padding: "7px 12px" }} placeholder="Or type a model name..." value={customModel} onChange={e => setCustomModel(e.target.value)} onKeyDown={e => { if (e.key === "Enter") setShowModels(false) }} />
        </div>
      )}

      <div className="ai-chat-messages">
        {messages.length === 1 && (
          <div className="ai-suggestions">
            {SUGGESTIONS.map(s => <button key={s} className="ai-suggestion-chip" onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ${msg.role === "user" ? "ai-message-user" : "ai-message-ai"}`}>
            {msg.role === "assistant" && <div className="ai-message-avatar"><svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></div>}
            <div className="ai-message-content-wrap">
              <div className="ai-message-bubble">
                {msg.loading ? <div className="ai-typing"><span/><span/><span/></div> : <div className="ai-message-text">{msg.content}</div>}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="ai-chat-input-wrap">
        <textarea className="ai-chat-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={`Ask ${activeModel}...`} rows={1} disabled={loading} />
        <button className="ai-chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
          <svg className="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z" fill="currentColor"/></svg>
        </button>
      </div>
    </div>
  )
}