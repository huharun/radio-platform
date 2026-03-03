"use client"
import { useEffect, useState } from "react"
import { getMyStats } from "@/lib/api"
import { IconRadio } from "./Icons"

export default function StatsPanel({ onPlay }: { onPlay: (s: any) => void }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { getMyStats().then(s => { setStats(s); setLoading(false) }) }, [])

  if (loading) return <p className="loading">Loading stats...</p>
  if (!stats || stats.total_plays === 0) return <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>No listening history yet — start playing stations!</p>

  return (
    <div className="stats-wrap" style={{ padding: 0 }}>
      <div className="stats-grid">
        <div className="stat-card glass"><div className="stat-number">{stats.total_plays}</div><div className="stat-label">Total Plays</div></div>
        <div className="stat-card glass"><div className="stat-number">{stats.unique_stations}</div><div className="stat-label">Stations</div></div>
        <div className="stat-card glass"><div className="stat-number">{stats.top_countries?.[0]?.country || "—"}</div><div className="stat-label">Top Country</div></div>
      </div>

      {stats.top_countries?.length > 0 && (
        <>
          <div className="stats-section-label" style={{ marginBottom: 10 }}>Top Countries</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {stats.top_countries.map((c: any, i: number) => (
              <div key={c.country} style={{ padding: "6px 14px", borderRadius: 999, background: "var(--bg-surface)", border: "1px solid var(--glass-border)", fontSize: 13, display: "flex", gap: 8 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>#{i + 1}</span>
                <span>{c.country}</span>
                <span style={{ color: "var(--text-muted)" }}>{c.plays}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {stats.top_stations?.length > 0 && (
        <>
          <div className="stats-section-label" style={{ marginBottom: 10 }}>Most Played</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {stats.top_stations.map((s: any, i: number) => (
              <div key={s.station_uuid} className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, cursor: "pointer" }}
                onClick={() => onPlay({ stationuuid: s.station_uuid, name: s.station_name, country: s.station_country, favicon: "", url_resolved: "", tags: "" })}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", width: 24, textAlign: "center" }}>{i + 1}</div>
                <div style={{ flex: 1 }}><div className="station-name">{s.station_name}</div><div className="station-country">{s.station_country}</div></div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.plays} plays</div>
              </div>
            ))}
          </div>
        </>
      )}

      {stats.recent?.length > 0 && (
        <>
          <div className="stats-section-label" style={{ marginBottom: 10 }}>Recently Played</div>
          <div className="stations-grid" style={{ padding: 0 }}>
            {stats.recent.map((s: any) => (
              <div key={s.station_uuid} className="station-card"
                onClick={() => onPlay({ stationuuid: s.station_uuid, name: s.station_name, country: s.station_country, favicon: "", url_resolved: "", tags: "" })}>
                <div className="station-favicon-fallback"><IconRadio /></div>
                <div className="station-info"><div className="station-name">{s.station_name}</div><div className="station-country">{s.station_country}</div></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}