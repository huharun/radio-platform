"use client"
import { useState, useEffect } from "react"
import { getMyPlaylists, createPlaylist, addStationToPlaylist } from "@/lib/api"

export default function PlaylistModal({ station, onClose }: { station: any; onClose: () => void }) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [done, setDone] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { getMyPlaylists().then((p: any) => setPlaylists(p || [])) }, [])

  const add = async (pid: string, pname: string) => {
    setLoading(true); await addStationToPlaylist(pid, station); setDone(pname); setLoading(false)
  }
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return
    setLoading(true); const p = await createPlaylist(name, "", false)
    await addStationToPlaylist(p.id, station); setDone(p.name); setLoading(false)
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
              <button className={`modal-tab ${!creating ? "active" : ""}`} onClick={() => setCreating(false)}>My Playlists</button>
              <button className={`modal-tab ${creating ? "active" : ""}`} onClick={() => setCreating(true)}>+ New</button>
            </div>
            {!creating ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playlists.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No playlists yet.</p>}
                {playlists.map(p => (
                  <button key={p.id} className="dropdown-item" onClick={() => add(p.id, p.name)} disabled={loading}>
                    🎵 {p.name}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{p.stations?.length || 0} stations</span>
                  </button>
                ))}
              </div>
            ) : (
              <form className="modal-form" onSubmit={create}>
                <input className="search-input" placeholder="Playlist name" value={name} onChange={e => setName(e.target.value)} required />
                <button className="search-btn modal-submit" type="submit" disabled={loading}>{loading ? "..." : "Create & Add"}</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}