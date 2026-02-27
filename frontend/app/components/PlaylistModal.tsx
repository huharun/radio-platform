"use client"
import { useState, useEffect } from "react"
import { getMyPlaylists, createPlaylist, addStationToPlaylist } from "@/lib/api"

interface Station {
  stationuuid: string
  name: string
  country: string
  favicon: string
  url_resolved: string
}

interface Props {
  station: Station
  onClose: () => void
}

export default function PlaylistModal({ station, onClose }: Props) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [creating,  setCreating]  = useState(false)
  const [name,      setName]      = useState("")
  const [desc,      setDesc]      = useState("")
  const [pub,       setPub]       = useState(true)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState<string | null>(null)

  useEffect(() => {
    getMyPlaylists().then(setPlaylists)
  }, [])

  const add = async (playlistId: string, playlistName: string) => {
    setLoading(true)
    await addStationToPlaylist(playlistId, station)
    setDone(playlistName)
    setLoading(false)
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const p = await createPlaylist(name, desc, pub)
    await addStationToPlaylist(p.id, station)
    setDone(p.name)
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass" onClick={e => e.stopPropagation()}>

        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <div style={{ fontWeight: 600 }}>Added to {done}</div>
            <button className="search-btn" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-tabs">
              <button className={`modal-tab ${!creating ? "active" : ""}`} onClick={() => setCreating(false)}>
                My Playlists
              </button>
              <button className={`modal-tab ${creating ? "active" : ""}`} onClick={() => setCreating(true)}>
                + New
              </button>
            </div>

            {!creating ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playlists.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "8px 0" }}>
                    No playlists yet — create one.
                  </p>
                )}
                {playlists.map(p => (
                  <button key={p.id} className="dropdown-item" onClick={() => add(p.id, p.name)}>
                    🎵 {p.name}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
                      {p.stations?.length || 0} stations
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <form className="modal-form" onSubmit={create}>
                <input className="search-input" placeholder="Playlist name" value={name}
                  onChange={e => setName(e.target.value)} required />
                <input className="search-input" placeholder="Description (optional)" value={desc}
                  onChange={e => setDesc(e.target.value)} />
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input type="checkbox" checked={pub} onChange={e => setPub(e.target.checked)} />
                  Public playlist
                </label>
                <button className="search-btn modal-submit" type="submit" disabled={loading}>
                  {loading ? "..." : "Create & Add"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}