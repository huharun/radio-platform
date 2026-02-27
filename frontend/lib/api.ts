const API = typeof window !== "undefined"
  ? `http://${window.location.hostname}:8000`
  : "http://localhost:8000"

function getToken() {
  const user = JSON.parse(localStorage.getItem("radio_user") || "null")
  return user?.token || null
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getTrending() {
  const res = await fetch(`${API}/stations/trending`)
  return res.json()
}

export async function searchStations(query: string) {
  const res = await fetch(`${API}/stations/search?name=${query}`)
  return res.json()
}

export async function logPlay(uuid: string) {
  await fetch(`${API}/stations/${uuid}/play`, { method: "POST" })
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) throw new Error((await res.json()).detail)
  return res.json()
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error((await res.json()).detail)
  return res.json()
}

export async function getFavorites() {
  const res = await fetch(`${API}/favorites/`, { headers: authHeaders() })
  if (!res.ok) return []
  return res.json()
}

export async function addFavorite(station: {
  stationuuid: string, name: string, country: string, favicon: string, url_resolved: string
}) {
  const res = await fetch(`${API}/favorites/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      station_uuid: station.stationuuid,
      station_name: station.name,
      station_country: station.country,
      station_favicon: station.favicon,
      station_url: station.url_resolved,
    })
  })
  return res.json()
}

export async function removeFavorite(uuid: string) {
  await fetch(`${API}/favorites/${uuid}`, { method: "DELETE", headers: authHeaders() })
}


export async function getMyPlaylists() {
  const res = await fetch(`${API}/playlists/`, { headers: authHeaders() })
  if (!res.ok) return []
  return res.json()
}

export async function createPlaylist(name: string, description: string, pub: boolean) {
  const res = await fetch(`${API}/playlists/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, description, public: pub })
  })
  return res.json()
}

export async function deletePlaylist(id: string) {
  await fetch(`${API}/playlists/${id}`, { method: "DELETE", headers: authHeaders() })
}

export async function addStationToPlaylist(playlistId: string, station: any) {
  const res = await fetch(`${API}/playlists/${playlistId}/stations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      station_uuid: station.stationuuid,
      station_name: station.name,
      station_country: station.country,
      station_favicon: station.favicon,
      station_url: station.url_resolved,
    })
  })
  return res.json()
}

export async function removeStationFromPlaylist(playlistId: string, stationUuid: string) {
  await fetch(`${API}/playlists/${playlistId}/stations/${stationUuid}`, {
    method: "DELETE", headers: authHeaders()
  })
}