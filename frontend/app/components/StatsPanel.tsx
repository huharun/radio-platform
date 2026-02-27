"use client"
import { useEffect, useState } from "react"
import { getMyStats } from "@/lib/api"

interface Props {
  onPlay: (s: any) => void
}

export default function StatsPanel({ onPlay }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  if (loading) return <p className="loading">Loading stats</p>
  if (!stats || stats.total_plays === 0) return (
    <p style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
      No listening history yet — start playing stations.
    </p>
  )

  return (
    <div className="stats-wrap">
      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-number">{stats.total_plays}</div>
          <div className="stat-label">Total Plays</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-number">{stats.top_countries[0]?.country || "—"}</div>
          <div className="stat-label">Top Country</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-number">{stats.top_stations.length}</div>
          <div className="stat-label">Stations Heard</div>
        </div>
      </div>

      {/* Top stations */}
      {stats.top_stations.length > 0 && (
        <>
          <div className="stats-section-label">Most Played</div>
          <div className="stats-list">
            {stats.top_stations.map((s: any, i: number) => (
              <div key={s.name} className="stats-row glass">
                <div className="stats-rank">{i + 1}</div>
                <div className="stats-name">{s.name}</div>
                <div className="stats-count">{s.count} plays</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent */}
      {stats.recent.length > 0 && (
        <>
          <div className="stats-section-label">Recently Played</div>
          <div className="stations-grid">
            {stats.recent.map((s: any) => (
              <div
                key={s.station_uuid}
                className="station-card"
                onClick={() => onPlay({
                  stationuuid: s.station_uuid,
                  name: s.station_name,
                  country: s.station_country,
                  favicon: "", url_resolved: "", tags: ""
                })}
              >
                <div className="station-favicon-fallback" style={{ width: 44, height: 44 }}>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/>
                  </svg>
                </div>
                <div className="station-info">
                  <div className="station-name">{s.station_name}</div>
                  <div className="station-country">{s.station_country}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}