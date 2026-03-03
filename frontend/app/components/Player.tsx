"use client"
import { useState, useRef, useEffect } from "react"
import { IconPlay, IconPause, IconRadio } from "./Icons"

interface Station { stationuuid: string; name: string; url_resolved: string; country: string; favicon: string }

export default function Player({ station }: { station: Station | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [error,   setError]   = useState(false)
  const [volume,  setVolume]  = useState(1)

  useEffect(() => {
    if (!station || !audioRef.current) return
    setError(false)
    audioRef.current.src = station.url_resolved
    audioRef.current.volume = volume
    audioRef.current.play().then(() => setPlaying(true)).catch(() => { setPlaying(false); setError(true) })
  }, [station])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  if (!station) return null
  return (
    <div className="player">
      <audio ref={audioRef} onError={() => { setPlaying(false); setError(true) }} />
      {station.favicon
        ? <img src={station.favicon} className="player-favicon" onError={e => (e.currentTarget.style.display = "none")} />
        : <div className="player-favicon-fallback"><IconRadio className="icon-lg" /></div>
      }
      <div className="player-info">
        <div className="player-name">
          {station.name}
          {playing && !error && <span className="live-badge"><span className="live-badge-dot" /> Live</span>}
          {error && <span style={{ fontSize: 11, color: "#ff375f", marginLeft: 8 }}>Stream unavailable</span>}
        </div>
        <div className="player-country">{station.country}</div>
      </div>
      <input type="range" min="0" max="1" step="0.05" value={volume}
        onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v }}
        style={{ width: 72, accentColor: "var(--accent)", cursor: "pointer" }} title="Volume" />
      <button className="player-btn" onClick={toggle} disabled={error}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>
    </div>
  )
}