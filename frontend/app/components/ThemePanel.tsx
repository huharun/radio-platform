"use client"
import { useState } from "react"

export type ThemeConfig = {
  name: string
  bg: string
  surface: string
  accent: string
  accent2: string
  orb1: string
  orb2: string
  text: string
}

const PRESETS: ThemeConfig[] = [
  { name: "amoled",  bg: "#000000", surface: "rgba(255,255,255,0.05)", accent: "#bf5af2", accent2: "#0a84ff", orb1: "#2d0670", orb2: "#0a3a6e", text: "rgba(255,255,255,0.95)" },
  { name: "dark",    bg: "#0d0d14", surface: "rgba(255,255,255,0.07)", accent: "#0a84ff", accent2: "#30d158", orb1: "#0a2a5e", orb2: "#0a3d1f", text: "rgba(255,255,255,0.92)" },
  { name: "light",   bg: "#f0f0f7", surface: "rgba(255,255,255,0.55)", accent: "#ff2d55", accent2: "#007aff", orb1: "rgba(255,45,85,0.18)", orb2: "rgba(0,122,255,0.15)", text: "rgba(0,0,0,0.88)" },
  { name: "rose",    bg: "#0e0008", surface: "rgba(255,200,220,0.06)", accent: "#ff375f", accent2: "#ff9f0a", orb1: "#5e0025", orb2: "#3d0a1a", text: "rgba(255,240,245,0.95)" },
  { name: "ocean",   bg: "#00080f", surface: "rgba(0,180,255,0.06)",   accent: "#00b4ff", accent2: "#00ffcc", orb1: "#003a5e", orb2: "#003d35", text: "rgba(220,245,255,0.95)" },
  { name: "forest",  bg: "#020f02", surface: "rgba(100,200,80,0.06)",  accent: "#30d158", accent2: "#a3e635", orb1: "#0a2e05", orb2: "#1a3d05", text: "rgba(220,255,220,0.95)" },
]

interface Props {
  current: ThemeConfig
  onChange: (t: ThemeConfig) => void
}

export default function ThemePanel({ current, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState({ bg: "#000000", accent: "#bf5af2", accent2: "#0a84ff" })

  const applyCustom = () => {
    onChange({
      name: "custom",
      bg: custom.bg,
      surface: "rgba(255,255,255,0.07)",
      accent: custom.accent,
      accent2: custom.accent2,
      orb1: custom.accent + "55",
      orb2: custom.accent2 + "44",
      text: "rgba(255,255,255,0.95)",
    })
  }

  return (
    <div className="theme-panel-wrap">
      <button className="theme-toggle-btn" onClick={() => setOpen(o => !o)} title="Themes">
        <span style={{ fontSize: 16 }}>🎨</span>
      </button>

      {open && (
        <div className="theme-panel glass">
          <div className="theme-panel-title">Theme</div>

          {/* Presets */}
          <div className="preset-row">
            {PRESETS.map(p => (
              <button
                key={p.name}
                className={`preset-dot ${current.name === p.name ? "active" : ""}`}
                style={{ background: `linear-gradient(135deg, ${p.bg === "#f0f0f7" ? "#e0e0ef" : p.bg} 40%, ${p.accent})` }}
                onClick={() => { onChange(p); }}
                title={p.name}
              />
            ))}
          </div>

          {/* Custom pickers */}
          <div className="custom-row">
            <label className="color-label">
              <span>BG</span>
              <input type="color" value={custom.bg} onChange={e => setCustom(c => ({ ...c, bg: e.target.value }))} />
            </label>
            <label className="color-label">
              <span>Accent</span>
              <input type="color" value={custom.accent} onChange={e => setCustom(c => ({ ...c, accent: e.target.value }))} />
            </label>
            <label className="color-label">
              <span>Accent 2</span>
              <input type="color" value={custom.accent2} onChange={e => setCustom(c => ({ ...c, accent2: e.target.value }))} />
            </label>
          </div>
          <button className="apply-btn" onClick={applyCustom}>Apply Custom</button>
        </div>
      )}
    </div>
  )
}