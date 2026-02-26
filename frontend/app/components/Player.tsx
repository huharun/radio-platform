"use client"
import { useState, useRef, useEffect } from "react"

interface Station {
  stationuuid: string
  name: string
  url_resolved: string
  country: string
  favicon: string
}

export default function Player({ station }: { station: Station | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!station || !audioRef.current) return
    audioRef.current.src = station.url_resolved
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [station])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  if (!station) return null

  return (
    <div className="player">
      <audio ref={audioRef} />
      {station.favicon
        ? <img src={station.favicon} className="player-favicon" onError={e => (e.currentTarget.style.display = "none")} />
        : <div className="player-favicon-fallback">📻</div>
      }
      <div className="player-info">
        <div className="player-name">
          {station.name}
          {playing && (
            <span className="player-live-badge">
              <span className="player-live-dot" />
              Live
            </span>
          )}
        </div>
        <div className="player-country">{station.country}</div>
      </div>
      <button className="player-btn" onClick={toggle}>
        {playing ? "⏸" : "▶"}
      </button>
    </div>
  )
}