"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Player from "@/components/Player"
import ThemePanel, { ThemeConfig } from "@/components/ThemePanel"
import AuthModal from "@/components/AuthModal"
import FavoriteBtn from "@/components/FavoriteBtn"
import PlaylistModal from "@/components/PlaylistModal"
import FilterBar from "@/components/FilterBar"
import StatsPanel from "@/components/StatsPanel"
import { useAuth } from "@/lib/auth"
import {
  getTrending, logPlay, getFavorites, getMyPlaylists,
  getSimilar, logPlayStat
} from "@/lib/api"
import {
  IconHome, IconLibrary, IconPlus, IconSignOut,
  IconMusic, IconChevronLeft, IconRadio, IconHeart
} from "@/components/Icons"

interface Station {
  stationuuid: string
  name: string
  url_resolved: string
  country: string
  favicon: string
  tags: string
}

const DEFAULT_THEME: ThemeConfig = {
  name: "amoled", bg: "#000000",
  surface: "rgba(255,255,255,0.05)",
  accent: "#bf5af2", accent2: "#0a84ff",
  orb1: "#2d0670", orb2: "#0a3a6e",
  text: "rgba(255,255,255,0.95)",
}

function applyTheme(t: ThemeConfig) {
  const r = document.documentElement.style
  r.setProperty("--bg-base",             t.bg)
  r.setProperty("--bg-surface",          t.surface)
  r.setProperty("--bg-surface-2",        t.surface.replace(/[\d.]+\)$/, s => String(Math.min(parseFloat(s) * 1.8, 0.9)) + ")"))
  r.setProperty("--bg-header",           t.bg + "b3")
  r.setProperty("--bg-player",           t.bg + "d4")
  r.setProperty("--accent",              t.accent)
  r.setProperty("--accent-2",            t.accent2)
  r.setProperty("--accent-glow",         t.accent + "44")
  r.setProperty("--glass-border-active", t.accent + "88")
  r.setProperty("--text-primary",        t.text)
  r.setProperty("--orb-1",               t.orb1)
  r.setProperty("--orb-2",               t.orb2)
  r.setProperty("--orb-3",               t.accent + "66")
  r.setProperty("--orb-4",               t.accent2 + "44")
  if (t.name === "light") {
    r.setProperty("--glass-border",   "rgba(0,0,0,0.08)")
    r.setProperty("--text-secondary", "rgba(0,0,0,0.45)")
    r.setProperty("--text-muted",     "rgba(0,0,0,0.25)")
  } else {
    r.setProperty("--glass-border",   "rgba(255,255,255,0.10)")
    r.setProperty("--text-secondary", "rgba(255,255,255,0.50)")
    r.setProperty("--text-muted",     "rgba(255,255,255,0.24)")
  }
}

type Page = "home" | "library"

export default function Home() {
  const { user, logout }  = useAuth()
  const [stations,        setStations]        = useState<Station[]>([])
  const [current,         setCurrent]         = useState<Station | null>(null)
  const [query,           setQuery]           = useState("")
  const [loading,         setLoading]         = useState(true)
  const [theme,           setTheme]           = useState<ThemeConfig>(DEFAULT_THEME)
  const [showAuth,        setShowAuth]        = useState(false)
  const [page,            setPage]            = useState<Page>("home")
  const [dropdown,        setDropdown]        = useState(false)
  const [playlistStation, setPlaylistStation] = useState<Station | null>(null)
  const [filters,         setFilters]         = useState({ genre: "", country: "" })
  const [recStations,     setRecStations]     = useState<Station[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const API = typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : "http://localhost:8000"

  useEffect(() => { applyTheme(DEFAULT_THEME) }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleTheme = useCallback((t: ThemeConfig) => {
    setTheme(t); applyTheme(t)
  }, [])

  useEffect(() => {
    getTrending().then(data => { setStations(data); setLoading(false) })
  }, [])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const params: any = {}
    if (query.trim())   params.name    = query
    if (filters.genre)  params.tag     = filters.genre
    if (filters.country) params.countrycode = filters.country
    if (!query.trim() && !filters.genre && !filters.country) {
      getTrending().then(data => { setStations(data); setLoading(false) })
      return
    }
    const res = await fetch(`${API}/stations/search?` + new URLSearchParams(params))
    setStations(await res.json())
    setLoading(false)
  }

  const handleFilter = (f: { genre: string, country: string }) => {
    setFilters(f)
    setLoading(true)
    const params: any = { order: "clickcount", reverse: "true" }
    if (f.genre)   params.tag         = f.genre
    if (f.country) params.countrycode = f.country
    if (!f.genre && !f.country) {
      getTrending().then(data => { setStations(data); setLoading(false) })
      return
    }
    fetch(`${API}/stations/search?` + new URLSearchParams(params))
      .then(r => r.json())
      .then(data => { setStations(data); setLoading(false) })
  }

  const play = (station: Station) => {
    logPlay(station.stationuuid)
    logPlayStat(station.stationuuid, station.name, station.country)
    setCurrent(station)
    getSimilar(station.stationuuid).then(setRecStations)
  }

  const sectionLabel = query
    ? "Results"
    : filters.genre || filters.country
      ? `${filters.genre || ""} ${filters.country || ""}`.trim()
      : "Trending Now"

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

          <nav className="nav">
            <button
              className={`nav-link ${page === "home" ? "active" : ""}`}
              onClick={() => setPage("home")}
            >
              <IconHome /><span>Discover</span>
            </button>
            <button
              className={`nav-link ${page === "library" ? "active" : ""}`}
              onClick={() => { if (!user) { setShowAuth(true); return } setPage("library") }}
            >
              <IconLibrary /><span>Library</span>
            </button>
          </nav>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ThemePanel current={theme} onChange={handleTheme} />
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <button className="user-avatar-btn" onClick={() => setDropdown(d => !d)} title={user.username}>
                  {user.username[0].toUpperCase()}
                </button>
                {dropdown && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-name">
                      {user.username}
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>
                    <button className="dropdown-item" onClick={() => { setPage("library"); setDropdown(false) }}>
                      <IconLibrary /> My Library
                    </button>
                    <button className="dropdown-item danger" onClick={() => { logout(); setDropdown(false) }}>
                      <IconSignOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="sign-in-btn" onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </div>
        </header>

        {/* ── HOME ── */}
        {page === "home" && (
          <>
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

            <FilterBar active={filters} onChange={handleFilter} />

            <div className="section-label">{sectionLabel}</div>

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
                    : <div className="station-favicon-fallback"><IconRadio /></div>
                  }
                  <div className="station-info">
                    <div className="station-name">{station.name}</div>
                    <div className="station-country">{station.country}</div>
                    <div className="station-tags">{station.tags}</div>
                  </div>
                  <div className="card-actions">
                    {current?.stationuuid === station.stationuuid && (
                      <div className="equalizer"><span /><span /><span /></div>
                    )}
                    <FavoriteBtn station={station} onAuthRequired={() => setShowAuth(true)} />
                    <button
                      className="playlist-add-btn"
                      title="Add to playlist"
                      onClick={e => {
                        e.stopPropagation()
                        if (!user) { setShowAuth(true); return }
                        setPlaylistStation(station)
                      }}
                    >
                      <IconPlus className="icon-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Similar stations */}
            {recStations.length > 0 && current && (
              <div className="rec-section">
                <div className="section-label">Similar to {current.name}</div>
                <div className="stations-grid">
                  {recStations.slice(0, 6).map(station => (
                    <div
                      key={station.stationuuid}
                      className={`station-card ${current?.stationuuid === station.stationuuid ? "active" : ""}`}
                      onClick={() => play(station)}
                    >
                      {station.favicon
                        ? <img src={station.favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")} />
                        : <div className="station-favicon-fallback"><IconRadio /></div>
                      }
                      <div className="station-info">
                        <div className="station-name">{station.name}</div>
                        <div className="station-country">{station.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── LIBRARY ── */}
        {page === "library" && user && (
          <LibraryPage onPlay={play} current={current} />
        )}
      </div>

      <Player station={current} />
      {showAuth    && <AuthModal onClose={() => setShowAuth(false)} />}
      {playlistStation && <PlaylistModal station={playlistStation} onClose={() => setPlaylistStation(null)} />}
    </>
  )
}

// ── Library ──
function LibraryPage({ onPlay, current }: { onPlay: (s: any) => void, current: any }) {
  const [favs,      setFavs]      = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tab,       setTab]       = useState<"favs" | "playlists" | "stats">("favs")
  const [openPl,    setOpenPl]    = useState<any | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getFavorites(), getMyPlaylists()])
      .then(([f, p]) => { setFavs(f); setPlaylists(p); setLoading(false) })
  }, [])

  if (loading) return <p className="loading">Loading</p>

  return (
    <>
      <div className="section-label">My Library</div>

      <div style={{ padding: "0 20px 16px" }}>
        <div className="modal-tabs" style={{ maxWidth: 320 }}>
          <button className={`modal-tab ${tab === "favs" ? "active" : ""}`} onClick={() => setTab("favs")}>
            <IconHeart className="icon-sm" /> Saved ({favs.length})
          </button>
          <button className={`modal-tab ${tab === "playlists" ? "active" : ""}`} onClick={() => setTab("playlists")}>
            <IconMusic className="icon-sm" /> Playlists ({playlists.length})
          </button>
          <button className={`modal-tab ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>
            Stats
          </button>
        </div>
      </div>

      {/* ── FAVORITES ── */}
      {tab === "favs" && (
        <div className="stations-grid">
          {favs.length === 0 && (
            <p style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>No favorites yet.</p>
          )}
          {favs.map(f => {
            const station = {
              stationuuid: f.station_uuid, name: f.station_name,
              country: f.station_country, favicon: f.station_favicon,
              url_resolved: f.station_url, tags: ""
            }
            return (
              <div
                key={f.station_uuid}
                className={`station-card ${current?.stationuuid === f.station_uuid ? "active" : ""}`}
                onClick={() => onPlay(station)}
              >
                {f.station_favicon
                  ? <img src={f.station_favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")} />
                  : <div className="station-favicon-fallback"><IconRadio /></div>
                }
                <div className="station-info">
                  <div className="station-name">{f.station_name}</div>
                  <div className="station-country">{f.station_country}</div>
                </div>
                {current?.stationuuid === f.station_uuid && (
                  <div className="equalizer"><span /><span /><span /></div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PLAYLISTS ── */}
      {tab === "playlists" && (
        <>
          {openPl ? (
            <>
              <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <button className="nav-link" onClick={() => setOpenPl(null)}>
                  <IconChevronLeft /> Back
                </button>
                <span style={{ fontWeight: 700 }}>{openPl.name}</span>
                <span className="playlist-badge">{openPl.public ? "Public" : "Private"}</span>
              </div>
              <div className="stations-grid">
                {openPl.stations?.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No stations yet.</p>
                )}
                {openPl.stations?.map((s: any) => {
                  const station = {
                    stationuuid: s.station_uuid, name: s.station_name,
                    country: s.station_country, favicon: s.station_favicon,
                    url_resolved: s.station_url, tags: ""
                  }
                  return (
                    <div
                      key={s.station_uuid}
                      className={`station-card ${current?.stationuuid === s.station_uuid ? "active" : ""}`}
                      onClick={() => onPlay(station)}
                    >
                      {s.station_favicon
                        ? <img src={s.station_favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")} />
                        : <div className="station-favicon-fallback"><IconRadio /></div>
                      }
                      <div className="station-info">
                        <div className="station-name">{s.station_name}</div>
                        <div className="station-country">{s.station_country}</div>
                      </div>
                      {current?.stationuuid === s.station_uuid && (
                        <div className="equalizer"><span /><span /><span /></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="stations-grid">
              {playlists.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>
                  No playlists yet — click + on any station.
                </p>
              )}
              {playlists.map(p => (
                <div key={p.id} className="playlist-card" onClick={() => setOpenPl(p)}>
                  <div className="playlist-card-icon"><IconMusic className="icon-lg" /></div>
                  <div className="playlist-card-name">{p.name}</div>
                  <div className="playlist-card-meta">
                    <span>{p.stations?.length || 0} stations</span>
                    <span className="playlist-badge">{p.public ? "Public" : "Private"}</span>
                  </div>
                  {p.description && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{p.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── STATS ── */}
      {tab === "stats" && <StatsPanel onPlay={onPlay} />}
    </>
  )
}