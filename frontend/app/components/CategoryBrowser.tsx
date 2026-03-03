"use client"
import { useState, useEffect } from "react"
import { getCountries, getTags, getLanguages } from "@/lib/api"

const GRADIENTS = [
  "linear-gradient(135deg,#1a1a2e,#16213e)", "linear-gradient(135deg,#0f3460,#533483)",
  "linear-gradient(135deg,#1b4332,#40916c)", "linear-gradient(135deg,#3d0000,#a50000)",
  "linear-gradient(135deg,#1a0533,#6a0572)", "linear-gradient(135deg,#0a1931,#185a9d)",
  "linear-gradient(135deg,#3b1f00,#8b4513)", "linear-gradient(135deg,#003333,#006666)",
]

function Section({ title, items, type, onSelect }: any) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, 12)
  return (
    <div className="cat-section">
      <div className="cat-section-header">
        <div className="section-label" style={{ padding: 0 }}>{title}</div>
        {items.length > 12 && (
          <button className="cat-see-more" onClick={() => setShowAll(s => !s)}>
            {showAll ? "Show less" : `See all ${items.length}`}
          </button>
        )}
      </div>
      <div className="cat-grid">
        {visible.map((item: any, i: number) => (
          <button
            key={item.name}
            className="cat-card"
            style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            onClick={() => onSelect(type, item)}
          >
            <div className="cat-name">{item.name}</div>
            <div className="cat-count">{Number(item.count).toLocaleString()} stations</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CategoryBrowser({ onSelect }: { onSelect: (type: string, item: any) => void }) {
  const [countries, setCountries] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [languages, setLanguages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCountries(), getTags(), getLanguages()]).then(([c, t, l]) => {
      setCountries(c || []); setTags(t || []); setLanguages(l || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="loading">Loading categories...</p>
  return (
    <div className="cat-browser">
      <Section title="Countries" items={countries} type="country" onSelect={onSelect} />
      <Section title="Genres"    items={tags}      type="tag"     onSelect={onSelect} />
      <Section title="Languages" items={languages} type="language" onSelect={onSelect} />
    </div>
  )
}