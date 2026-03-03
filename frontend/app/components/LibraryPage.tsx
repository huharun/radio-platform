"use client"
import { useState, useEffect } from "react"
import { getFavorites, getMyPlaylists, deletePlaylist, removeStationFromPlaylist } from "@/lib/api"
import { IconRadio, IconTrash, IconMusic } from "./Icons"
import StatsPanel from "./StatsPanel"

export default function LibraryPage({ onPlay, current }: { onPlay: (s: any) => void; current: any }) {
  const [tab, setTab] = useState<"favorites" | "playlists" | "stats">("favorites")
  const [favorites, setFavorites] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getFavorites(), getMyPlaylists()]).then(([f, p]) => {
      setFavorites(f || []); setPlaylists(p || []); setLoading(false)
    })
  }, [])

  if (loading) return <p className="loading">Loading library...</p>

  return (
    <div className="library-wrap">
      <div className="library-tabs">
        <button className={`library-tab ${tab === "favorites" ? "active" : ""}`} onClick={() => setTab("favorites")}>Favorites</button>
        <button className={`library-tab ${tab === "playlists" ? "active" : ""}`} onClick={() => setTab("playlists")}>Playlists</button>
        <button className={`library-tab ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>Stats</button>
      </div>

      {tab === "favorites" && (
        <div className="stations-grid">
          {favorites.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No favorites yet.</p>}
          {favorites.map(s => (
            <div key={s.station_uuid} className={`station-card ${current?.stationuuid === s.station_uuid ? "active" : ""}`}
              onClick={() => onPlay({ stationuuid: s.station_uuid, name: s.station_name, country: s.station_country, favicon: s.station_favicon, url_resolved: s.station_url, tags: "" })}>
              {s.station_favicon ? <img src={s.station_favicon} className="station-favicon" onError={e => (e.currentTarget.style.display = "none")} /> : <div className="station-favicon-fallback"><IconRadio /></div>}
              <div className="station-info">
                <div className="station-name">{s.station_name}</div>
                <div className="station-country">{s.station_country}</div>
              </div>
              <button className="fav-btn saved" onClick={async e => { e.stopPropagation(); const { removeFavorite } = await import("@/lib/api"); await removeFavorite(s.station_uuid); setFavorites(f => f.filter(x => x.station_uuid !== s.station_uuid)) }} title="Remove">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "playlists" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {playlists.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No playlists yet.</p>}
          {playlists.map(pl => (
            <div key={pl.id} className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--glass-border)" }}>
                <IconMusic />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{pl.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pl.stations?.length || 0} stations</div>
                </div>
                <button className="fav-btn" onClick={async () => { await deletePlaylist(pl.id); setPlaylists(p => p.filter(x => x.id !== pl.id)) }}><IconTrash className="icon-sm" /></button>
              </div>
              {pl.stations?.map((s: any) => (
                <div key={s.station_uuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--glass-border)", cursor: "pointer" }}
                  onClick={() => onPlay({ stationuuid: s.station_uuid, name: s.station_name, country: s.station_country, favicon: s.station_favicon, url_resolved: s.station_url, tags: "" })}>
                  <div className="station-favicon-fallback" style={{ width: 32, height: 32 }}><IconRadio className="icon-sm" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="station-name">{s.station_name}</div>
                    <div className="station-country">{s.station_country}</div>
                  </div>
                  <button className="fav-btn" onClick={async e => { e.stopPropagation(); await removeStationFromPlaylist(pl.id, s.station_uuid); setPlaylists(p => p.map(x => x.id === pl.id ? { ...x, stations: x.stations.filter((st: any) => st.station_uuid !== s.station_uuid) } : x)) }}><IconTrash className="icon-sm" /></button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && <StatsPanel onPlay={onPlay} />}
    </div>
  )
}