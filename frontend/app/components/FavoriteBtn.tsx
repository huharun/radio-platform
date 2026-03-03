"use client"
import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { addFavorite, removeFavorite } from "@/lib/api"
import { IconHeart } from "./Icons"

interface Props { station: any; initialSaved?: boolean; onAuthRequired: () => void }

export default function FavoriteBtn({ station, initialSaved = false, onAuthRequired }: Props) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(initialSaved)

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { onAuthRequired(); return }
    if (saved) { await removeFavorite(station.stationuuid); setSaved(false) }
    else { await addFavorite(station); setSaved(true) }
  }

  return (
    <button className={`fav-btn ${saved ? "saved" : ""}`} onClick={toggle} title={saved ? "Remove" : "Save"}>
      <IconHeart filled={saved} />
    </button>
  )
}