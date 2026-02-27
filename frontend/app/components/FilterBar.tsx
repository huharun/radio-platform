"use client"
import { useState } from "react"

const GENRES = ["pop","rock","jazz","classical","electronic","hip-hop","country","news","talk","sports","ambient","metal","reggae","latin","rnb"]
const COUNTRIES = [
  { code: "US", name: "USA" }, { code: "GB", name: "UK" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" },
  { code: "BR", name: "Brazil" }, { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" }, { code: "CA", name: "Canada" },
  { code: "IN", name: "India" }, { code: "ES", name: "Spain" },
]

interface Filters {
  genre: string
  country: string
}

interface Props {
  onChange: (f: Filters) => void
  active: Filters
}

export default function FilterBar({ onChange, active }: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-scroll">
        {/* Clear */}
        <button
          className={`filter-chip ${!active.genre && !active.country ? "active" : ""}`}
          onClick={() => onChange({ genre: "", country: "" })}
        >
          All
        </button>

        {/* Genres */}
        {GENRES.map(g => (
          <button
            key={g}
            className={`filter-chip ${active.genre === g ? "active" : ""}`}
            onClick={() => onChange({ ...active, genre: active.genre === g ? "" : g })}
          >
            {g}
          </button>
        ))}

        <div className="filter-divider" />

        {/* Countries */}
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            className={`filter-chip ${active.country === c.code ? "active" : ""}`}
            onClick={() => onChange({ ...active, country: active.country === c.code ? "" : c.code })}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}