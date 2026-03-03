const getAPI = () =>
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:8000`
    : "http://backend:8000"

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("radio_user")
    if (!raw) return null
    return JSON.parse(raw)?.token ?? null
  } catch { return null }
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function get(path: string, headers: Record<string, string> = {}): Promise<any> {
  try {
    const res = await fetch(`${getAPI()}${path}`, { headers })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    console.error("GET error", path, e)
    return null
  }
}

async function post(path: string, body: unknown, headers: Record<string, string> = {}): Promise<any> {
  const res = await fetch(`${getAPI()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error" }))
    throw new Error(err.detail || "Error")
  }
  return res.json()
}

async function del(path: string): Promise<any> {
  try {
    const res = await fetch(`${getAPI()}${path}`, { method: "DELETE", headers: authHeaders() })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

// Stations
export const getTrending    = (limit = 500)    => get(`/stations/trending?limit=${limit}`)
export const searchStations = (params: string) => get(`/stations/search?${params}`)
export const getCountries   = ()               => get("/stations/categories/countries")
export const getTags        = ()               => get("/stations/categories/tags")
export const getLanguages   = ()               => get("/stations/categories/languages")

// Auth
export const register = (username: string, email: string, password: string) =>
  post("/auth/register", { username, email, password })
export const login = (email: string, password: string) =>
  post("/auth/login", { email, password })
export const getMe = () => get("/auth/me", authHeaders())

// Favorites
export const getFavorites   = ()             => get("/favorites/", authHeaders())
export const addFavorite    = (s: any)       => post("/favorites/", {
  station_uuid:    s.stationuuid,
  station_name:    s.name,
  station_country: s.country,
  station_favicon: s.favicon || "",
  station_url:     s.url_resolved || "",
}, authHeaders())
export const removeFavorite = (uuid: string) => del(`/favorites/${uuid}`)

// Playlists
export const getMyPlaylists = () => get("/playlists/", authHeaders())
export const createPlaylist = (name: string, description: string, pub: boolean) =>
  post("/playlists/", { name, description, public: pub }, authHeaders())
export const deletePlaylist = (id: string) => del(`/playlists/${id}`)
export const addStationToPlaylist = (pid: string, s: any) =>
  post(`/playlists/${pid}/stations`, {
    station_uuid:    s.stationuuid,
    station_name:    s.name,
    station_country: s.country,
    station_favicon: s.favicon || "",
    station_url:     s.url_resolved || "",
  }, authHeaders())
export const removeStationFromPlaylist = (pid: string, uuid: string) =>
  del(`/playlists/${pid}/stations/${uuid}`)

// Stats
export const getMyStats = () => get("/stats/me", authHeaders())
export const logPlayStat = (uuid: string, name: string, country: string) => {
  const t = getToken()
  if (!t) return
  fetch(`${getAPI()}/stats/play?station_uuid=${encodeURIComponent(uuid)}&station_name=${encodeURIComponent(name)}&station_country=${encodeURIComponent(country)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}` }
  }).catch(() => {})
}

// AI
export const checkAiHealth   = ()                                     => get("/ai/health")
export const sendChatMessage = (messages: any[], model: string)       => post("/ai/chat", { messages, model })