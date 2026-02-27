"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { addFavorite, removeFavorite, getFavorites } from "@/lib/api"
import { IconHeart } from "./Icons"

interface Station {
  stationuuid: string
  name: string
  country: string
  favicon: string
  url_resolved: string
}

interface Props {
  station: Station
  onAuthRequired: () => void
}

export default function FavoriteBtn({ station, onAuthRequired }: Props) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getFavorites().then((favs: any[]) => {
      setSaved(favs.some(f => f.station_uuid === station.stationuuid))
    })
  }, [user, station.stationuuid])

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { onAuthRequired(); return }
    if (saved) {
      await removeFavorite(station.stationuuid)
      setSaved(false)
    } else {
      await addFavorite(station)
      setSaved(true)
    }
  }

  return (
    <button className={`fav-btn ${saved ? "saved" : ""}`} onClick={toggle} title={saved ? "Remove" : "Save"}>
      <IconHeart filled={saved} />
    </button>
  )
}