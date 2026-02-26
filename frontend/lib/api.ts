const API = "http://localhost:8000"

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