"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Player          from "./components/Player"
import ThemePanel, { ThemeConfig } from "./components/ThemePanel"
import AuthModal       from "./components/AuthModal"
import FavoriteBtn     from "./components/FavoriteBtn"
import PlaylistModal   from "./components/PlaylistModal"
import AIChatPanel     from "./components/AIChatPanel"
import LibraryPage     from "./components/LibraryPage"
import CategoryBrowser from "./components/CategoryBrowser"
import { useAuth }     from "@/lib/auth"
import { logPlayStat, getFavorites } from "@/lib/api"
import { IconHome, IconLibrary, IconPlus, IconSignOut, IconRadio } from "./components/Icons"

interface Station { stationuuid: string; name: string; url_resolved: string; country: string; favicon: string; tags: string }

const DEFAULT_THEME: ThemeConfig = { name: "amoled", bg: "#000000", surface: "rgba(255,255,255,0.05)", accent: "#bf5af2", accent2: "#0a84ff", orb1: "#2d0670", orb2: "#0a3a6e", text: "rgba(255,255,255,0.95)" }

function applyTheme(t: ThemeConfig) {
  const r = document.documentElement.style
  r.setProperty("--bg-base", t.bg)
  r.setProperty("--bg-surface", t.surface)
  r.setProperty("--bg-surface-2", t.surface.replace(/[\d.]+\)$/, s => String(Math.min(parseFloat(s) * 1.8, 0.9)) + ")"))
  r.setProperty("--bg-header", t.bg + "b3")
  r.setProperty("--bg-player", t.bg + "d4")
  r.setProperty("--accent", t.accent)
  r.setProperty("--accent-2", t.accent2)
  r.setProperty("--accent-glow", t.accent + "44")
  r.setProperty("--glass-border-active", t.accent + "88")
  r.setProperty("--text-primary", t.text)
  r.setProperty("--orb-1", t.orb1); r.setProperty("--orb-2", t.orb2)
  r.setProperty("--orb-3", t.accent + "66"); r.setProperty("--orb-4", t.accent2 + "44")
  const light = t.name === "light"
  r.setProperty("--glass-border",   light ? "rgba(0,0,0,0.08)"  : "rgba(255,255,255,0.10)")
  r.setProperty("--text-secondary", light ? "rgba(0,0,0,0.45)"  : "rgba(255,255,255,0.50)")
  r.setProperty("--text-muted",     light ? "rgba(0,0,0,0.25)"  : "rgba(255,255,255,0.24)")
}

type Page = "home" | "browse" | "library" | "ai"

const PAGE_SIZE = 100

export default function App() {
  const { user, mounted, logout } = useAuth()
  const API = typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : "http://localhost:8000"

  const [stations,    setStations]    = useState<Station[]>([])
  const [current,     setCurrent]     = useState<Station | null>(null)
  const [query,       setQuery]       = useState("")
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore,     setHasMore]     = useState(true)
  const [offset,      setOffset]      = useState(0)
  const [label,       setLabel]       = useState("Trending Now")
  const [theme,       setTheme]       = useState<ThemeConfig>(DEFAULT_THEME)
  const [page,        setPage]        = useState<Page>("home")
  const [showAuth,    setShowAuth]    = useState(false)
  const [dropdown,    setDropdown]    = useState(false)
  const [chatOpen,    setChatOpen]    = useState(false)
  const [addStation,  setAddStation]  = useState<Station | null>(null)
  const [savedUuids,  setSavedUuids]  = useState<Set<string>>(new Set())

  // Store current search params so load more knows what to fetch
  const currentParams = useRef<Record<string, string>>({})
  const dropRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { applyTheme(DEFAULT_THEME) }, [])

  const fetchStations = useCallback(async (params: Record<string, string>, reset = true) => {
    if (reset) { setLoading(true); setStations([]) }
    else setLoadingMore(true)

    const qs = new URLSearchParams({ ...params, limit: String(PAGE_SIZE) }).toString()
    try {
      const res = await fetch(`${API}/stations/search?${qs}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      if (reset) setStations(list)
      else setStations(prev => [...prev, ...list])
      setHasMore(list.length === PAGE_SIZE)
    } catch {
      setHasMore(false)
    }
    if (reset) setLoading(false)
    else setLoadingMore(false)
  }, [API])

  // Initial load
  useEffect(() => {
    const params = { order: "clickcount", reverse: "true", offset: "0" }
    currentParams.current = params
    fetchStations(params, true)
  }, [])

  // Load favorites when user logs in
  useEffect(() => {
    if (!mounted) return
    if (!user) { setSavedUuids(new Set()); return }
    getFavorites().then((favs: any[]) => setSavedUuids(new Set(favs?.map(f => f.station_uuid) || [])))
  }, [user, mounted])

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdown(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const nextOffset = stations.length
        const params = { ...currentParams.current, offset: String(nextOffset) }
        fetchStations(params, false)
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, stations.length])

  const handleTheme = useCallback((t: ThemeConfig) => { setTheme(t); applyTheme(t) }, [])
  const play = useCallback((s: Station) => { logPlayStat(s.stationuuid, s.name, s.country); setCurrent(s) }, [])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const params: Record<string, string> = { name: query.trim(), order: "clickcount", reverse: "true", offset: "0" }
    currentParams.current = params
    setLabel(`"${query}"`)
    fetchStations(params, true)
  }

  const handleCategory = (type: string, item: any) => {
    let params: Record<string, string> = { order: "clickcount", reverse: "true", offset: "0" }
    if (type === "country") {
      if (item.code) params.countrycode = item.code
      else params.country = item.name
    } else if (type === "tag") {
      params.tag = item.name
    } else if (type === "language") {
      params.language = item.name
    }
    currentParams.current = params
    setLabel(item.name)
    setPage("home")
    fetchStations(params, true)
  }

  const goHome = () => {
    setQuery("")
    setLabel("Trending Now")
    const params = { order: "clickcount", reverse: "true", offset: "0" }
    currentParams.current = params
    fetchStations(params, true)
    setPage("home")
  }

  return (
    <>
      <div className="wallpaper"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/><div className="orb orb-4"/></div>
      <div className="page">
        <header className="header">
          <div className="header-logo"><span className="live-dot"/>RadioPlatform</div>
          <nav className="nav">
            <button className={`nav-link ${page === "home" ? "active" : ""}`} onClick={goHome}><IconHome/><span>Home</span></button>
            <button className={`nav-link ${page === "browse" ? "active" : ""}`} onClick={() => setPage("browse")}><span>Browse</span></button>
            <button className={`nav-link ${page === "library" ? "active" : ""}`} onClick={() => { if (!user) { setShowAuth(true); return } setPage("library") }}><IconLibrary/><span>Library</span></button>
            <button className={`nav-link ${page === "ai" ? "active" : ""}`} onClick={() => setPage("ai")}><span className="ai-nav-dot"/><span>AI</span></button>
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemePanel current={theme} onChange={handleTheme}/>
            {mounted && (user ? (
              <div className="user-menu" ref={dropRef}>
                <button className="user-avatar-btn" onClick={() => setDropdown(d => !d)}>{user.username[0].toUpperCase()}</button>
                {dropdown && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-name">{user.username}<div className="user-dropdown-email">{user.email}</div></div>
                    <button className="dropdown-item" onClick={() => { setPage("library"); setDropdown(false) }}><IconLibrary/> My Library</button>
                    <button className="dropdown-item danger" onClick={() => { logout(); setDropdown(false) }}><IconSignOut/> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="sign-in-btn" onClick={() => setShowAuth(true)}>Sign In</button>
            ))}
          </div>
        </header>

        {page === "home" && (
          <>
            <div className="search-wrap">
              <form className="search-form" onSubmit={search}>
                <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stations, genres, countries..."/>
                <button className="search-btn" type="submit">Search</button>
              </form>
            </div>
            <div className="section-label">
              {label}
              {!loading && <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)", marginLeft: 10 }}>{stations.length}{hasMore ? "+" : ""} stations</span>}
            </div>
            <div className="stations-grid">
              {loading && <p className="loading">Loading stations...</p>}
              {!loading && stations.length === 0 && <p className="loading">No stations found.</p>}
              {stations.map(s => (
                <div key={s.stationuuid} className={`station-card ${current?.stationuuid === s.stationuuid ? "active" : ""}`} onClick={() => play(s)}>
                  {s.favicon
                    ? <img src={s.favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")}/>
                    : <div className="station-favicon-fallback"><IconRadio/></div>
                  }
                  <div className="station-info">
                    <div className="station-name">{s.name}</div>
                    <div className="station-country">{s.country}</div>
                    <div className="station-tags">{s.tags}</div>
                  </div>
                  <div className="card-actions">
                    {current?.stationuuid === s.stationuuid && <div className="equalizer"><span/><span/><span/></div>}
                    <FavoriteBtn station={s} initialSaved={savedUuids.has(s.stationuuid)} onAuthRequired={() => setShowAuth(true)}/>
                    <button className="playlist-add-btn" onClick={e => { e.stopPropagation(); if (!user) { setShowAuth(true); return } setAddStation(s) }}><IconPlus className="icon-sm"/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={bottomRef} style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {loadingMore && <p className="loading">Loading more...</p>}
              {!hasMore && stations.length > 0 && <p style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>All {stations.length} stations loaded</p>}
            </div>
          </>
        )}

        {page === "browse"  && <CategoryBrowser onSelect={handleCategory}/>}
        {page === "library" && user && <LibraryPage onPlay={play} current={current}/>}
        {page === "ai"      && <div style={{ padding: "16px 24px 120px" }}><AIChatPanel onPlay={play} inline/></div>}
      </div>

      <Player station={current}/>
      {showAuth   && <AuthModal onClose={() => setShowAuth(false)}/>}
      {addStation && <PlaylistModal station={addStation} onClose={() => setAddStation(null)}/>}

      {page !== "ai" && (
        <>
          <button className={`ai-float-btn ${chatOpen ? "open" : ""}`} onClick={() => setChatOpen(o => !o)}>
            {chatOpen
              ? <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              : <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            }
          </button>
          {chatOpen && <AIChatPanel onPlay={s => { play(s); setChatOpen(false) }} onClose={() => setChatOpen(false)}/>}
        </>
      )}
    </>
  )
}