# 📻 RadioPlatform

> A full-stack internet radio platform with 50,000+ stations, AI chat, playlists, favorites, and listening stats.

![RadioPlatform demo](rec-radio.mp4)

---

## ✨ Features

- 🌍 **50,000+ live radio stations** via [Radio Browser API](https://www.radio-browser.info/) with infinite scroll
- 🔍 **Search & Browse** by name, genre, country, or language
- ❤️ **Favorites** — save stations to your account
- 🎵 **Playlists** — create and manage your own station playlists
- 📊 **Listening Stats** — total plays, top stations, top countries, recently played
- 🤖 **AI Chat** — local AI assistant powered by [Ollama](https://ollama.ai) (no API key needed)
- 🎨 **6 themes** + custom color picker (AMOLED, Dark, Light, Rose, Ocean, Forest)
- 🔐 **Auth** — register/login with JWT tokens
- ⚡ **Redis caching** — fast category and station lookups
- 🐳 **Fully Dockerized** — one command to run everything

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / Mac) or Docker + Docker Compose (Linux)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/radio-platform.git
cd radio-platform
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `SECRET_KEY` (anything works for local dev).

### 3. Run

```bash
docker compose up --build
```

First build takes ~2 minutes. Then open:

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:8000       |
| API Docs | http://localhost:8000/docs  |

That's it. Stations load automatically. 🎉

---

## 🤖 AI Chat (Optional)

The AI assistant runs **100% locally** — no API key, no data sent to the cloud.

1. Download [Ollama](https://ollama.ai/download) and install it
2. Pull a model:
   ```bash
   ollama pull gemma3:4b
   ```
3. Make sure Ollama is running, then click **AI** in the nav or the floating mic button

The backend auto-detects Ollama across `host.docker.internal`, `172.17.0.1`, and `localhost` — works on Windows, Mac, and Linux.

---

## 🗂 Project Structure

```
radio-platform/
├── docker-compose.yml
├── .env.example
├── backend/                  # FastAPI + Motor (async MongoDB) + Redis
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # App entry, CORS, rate limiting
│       ├── config.py         # Pydantic settings
│       ├── db.py             # MongoDB + Redis connection
│       ├── routes/
│       │   ├── auth.py       # Register, login, JWT
│       │   ├── stations.py   # Search, trending, categories
│       │   ├── library.py    # Favorites, playlists, stats
│       │   └── ai.py         # Ollama proxy
│       └── services/
│           ├── auth.py       # bcrypt + JWT helpers
│           └── radio.py      # Radio Browser API + Redis cache
└── frontend/                 # Next.js 14 (App Router) + TypeScript
    ├── Dockerfile
    ├── package.json
    ├── lib/
    │   ├── api.ts            # All API calls
    │   └── auth.ts           # Zustand auth store
    └── app/
        ├── page.tsx          # Main app shell + infinite scroll
        ├── globals.css       # Full design system (CSS vars, glass UI)
        └── components/
            ├── Player.tsx        # Persistent audio player
            ├── AuthModal.tsx     # Login / register modal
            ├── ThemePanel.tsx    # Theme switcher
            ├── FavoriteBtn.tsx   # Heart button
            ├── CategoryBrowser.tsx
            ├── LibraryPage.tsx   # Favorites + playlists + stats tabs
            ├── PlaylistModal.tsx
            ├── StatsPanel.tsx
            ├── AIChatPanel.tsx   # Ollama chat
            └── Icons.tsx         # SVG icon components
```

---

## 🛠 Tech Stack

| Layer     | Tech                                              |
|-----------|---------------------------------------------------|
| Frontend  | Next.js 14, TypeScript, Zustand, CSS Variables    |
| Backend   | FastAPI, Motor (async MongoDB), SlowAPI           |
| Database  | MongoDB 7                                         |
| Cache     | Redis 7                                           |
| AI        | Ollama (local LLM — gemma3:4b recommended)        |
| Data      | [Radio Browser API](https://www.radio-browser.info/) (free, open) |
| Container | Docker + Docker Compose                           |

---

## 📡 API Endpoints

```
GET  /health                          Health check
GET  /stations/trending               Trending stations (infinite scroll)
GET  /stations/search                 Search by name/tag/country/language
GET  /stations/categories/countries   Country list with station counts
GET  /stations/categories/tags        Genre/tag list
GET  /stations/categories/languages   Language list

POST /auth/register                   Create account
POST /auth/login                      Login → JWT
GET  /auth/me                         Current user

GET  /favorites/                      List favorites (auth)
POST /favorites/                      Add favorite (auth)
DEL  /favorites/{uuid}                Remove favorite (auth)

GET  /playlists/                      List playlists (auth)
POST /playlists/                      Create playlist (auth)
DEL  /playlists/{id}                  Delete playlist (auth)
POST /playlists/{id}/stations         Add station to playlist (auth)
DEL  /playlists/{id}/stations/{uuid}  Remove from playlist (auth)

POST /stats/play                      Log a play event (auth)
GET  /stats/me                        My listening stats (auth)

GET  /ai/health                       Check Ollama status
POST /ai/chat                         Chat with local LLM
```

---

## 🔧 Development Tips

**Rebuild only backend after Python changes:**
```bash
docker compose up --build backend
```

**View logs:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Reset everything (wipe DB):**
```bash
docker compose down -v
docker compose up --build
```

**Clear browser auth (if token errors after DB reset):**
```javascript
// Run in browser console
localStorage.clear()
```

---

## 🙏 Credits

- Station data by [Radio Browser](https://www.radio-browser.info/) — community-maintained, free & open
- AI powered by [Ollama](https://ollama.ai) — local LLM runtime
- Built with ❤️