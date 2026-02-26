"use client"
import { useState, useEffect, useCallback } from "react"
import Player from "@/components/Player"
import ThemePanel, { ThemeConfig } from "@/components/ThemePanel"
import { getTrending, searchStations, logPlay } from "@/lib/api"

interface Station {
  stationuuid: string
  name: string
  url_resolved: string
  country: string
  favicon: string
  tags: string
}

const DEFAULT_THEME: ThemeConfig = {
  name: "amoled",
  bg: "#000000",
  surface: "rgba(255,255,255,0.05)",
  accent: "#bf5af2",
  accent2: "#0a84ff",
  orb1: "#2d0670",
  orb2: "#0a3a6e",
  text: "rgba(255,255,255,0.95)",
}

function applyTheme(t: ThemeConfig) {
  const r = document.documentElement.style
  r.setProperty("--bg-base",            t.bg)
  r.setProperty("--bg-surface",         t.surface)
  r.setProperty("--bg-surface-2",       t.surface.replace(/[\d.]+\)$/, s => String(Math.min(parseFloat(s) * 1.8, 0.9)) + ")"))
  r.setProperty("--bg-header",          t.bg + "b3")
  r.setProperty("--bg-player",          t.bg + "d4")
  r.setProperty("--accent",             t.accent)
  r.setProperty("--accent-2",           t.accent2)
  r.setProperty("--accent-glow",        t.accent + "44")
  r.setProperty("--glass-border-active",t.accent + "88")
  r.setProperty("--text-primary",       t.text)
  r.setProperty("--orb-1",              t.orb1)
  r.setProperty("--orb-2",              t.orb2)
  r.setProperty("--orb-3",              t.accent + "66")
  r.setProperty("--orb-4",              t.accent2 + "44")

  // light theme tweaks
  if (t.name === "light") {
    r.setProperty("--glass-border", "rgba(0,0,0,0.08)")
    r.setProperty("--text-secondary", "rgba(0,0,0,0.45)")
    r.setProperty("--text-muted",     "rgba(0,0,0,0.25)")
    r.setProperty("--shadow-card",    "0 4px 24px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset")
    r.setProperty("--shadow-player",  "0 -4px 40px rgba(0,0,0,0.12), 0 24px 60px rgba(0,0,0,0.15)")
  } else {
    r.setProperty("--glass-border",  "rgba(255,255,255,0.10)")
    r.setProperty("--text-secondary","rgba(255,255,255,0.50)")
    r.setProperty("--text-muted",    "rgba(255,255,255,0.24)")
    r.setProperty("--shadow-card",   "0 4px 24px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset")
    r.setProperty("--shadow-player", "0 -4px 60px rgba(0,0,0,0.8), 0 24px 80px rgba(0,0,0,0.9)")
  }
}

export default function Home() {
  const [stations, setStations] = useState<Station[]>([])
  const [current,  setCurrent]  = useState<Station | null>(null)
  const [query,    setQuery]    = useState("")
  const [loading,  setLoading]  = useState(true)
  const [theme,    setTheme]    = useState<ThemeConfig>(DEFAULT_THEME)

  useEffect(() => { applyTheme(DEFAULT_THEME) }, [])

  const handleTheme = useCallback((t: ThemeConfig) => {
    setTheme(t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    getTrending().then(data => { setStations(data); setLoading(false) })
  }, [])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const data = await searchStations(query)
    setStations(data)
    setLoading(false)
  }

  const play = (station: Station) => {
    logPlay(station.stationuuid)
    setCurrent(station)
  }

  return (
    <>
      <div className="wallpaper">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      <div className="page">
        <header className="header">
          <div className="header-logo">
            <span className="live-dot" />
            RadioPlatform
          </div>
          <ThemePanel current={theme} onChange={handleTheme} />
        </header>

        <div className="search-wrap">
          <form className="search-form" onSubmit={search}>
            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stations, genres, countries..."
            />
            <button className="search-btn" type="submit">Search</button>
          </form>
        </div>

        <div className="section-label">{query ? "Results" : "Trending Now"}</div>

        <div className="stations-grid">
          {loading && <p className="loading">Loading</p>}
          {stations.map(station => (
            <div
              key={station.stationuuid}
              className={`station-card ${current?.stationuuid === station.stationuuid ? "active" : ""}`}
              onClick={() => play(station)}
            >
              {station.favicon
                ? <img src={station.favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")} />
                : <div className="station-favicon-fallback">📻</div>
              }
              <div className="station-info">
                <div className="station-name">{station.name}</div>
                <div className="station-country">{station.country}</div>
                <div className="station-tags">{station.tags}</div>
              </div>
              {current?.stationuuid === station.stationuuid && (
                <div className="equalizer"><span /><span /><span /></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Player station={current} />
    </>
  )
}