from fastapi import APIRouter
from pydantic import BaseModel
import httpx
import os

router = APIRouter(prefix="/ai", tags=["ai"])

# Try host.docker.internal (Windows/Mac Docker Desktop), fallback to host-gateway IP
OLLAMA_HOSTS = [
    os.getenv("OLLAMA_URL", "http://host.docker.internal:11434"),
    "http://172.17.0.1:11434",
    "http://localhost:11434",
]

async def get_ollama_url() -> str | None:
    for host in OLLAMA_HOSTS:
        try:
            async with httpx.AsyncClient(timeout=2) as client:
                res = await client.get(f"{host}/api/tags")
                if res.status_code == 200:
                    return host
        except Exception:
            continue
    return None

class ChatBody(BaseModel):
    messages: list[dict]
    model: str = "gemma3:4b"

@router.get("/health")
async def ai_health():
    url = await get_ollama_url()
    if url:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                res = await client.get(f"{url}/api/tags")
                models = [m["name"] for m in res.json().get("models", [])]
                return {"available": True, "models": models, "host": url}
        except Exception:
            pass
    return {
        "available": False,
        "models": [],
        "setup": {
            "steps": [
                "1. Download Ollama from https://ollama.ai/download",
                "2. Install and run Ollama",
                "3. Run: ollama pull gemma3:4b",
                "4. Click 'Retry Connection' below"
            ]
        }
    }

@router.post("/chat")
async def chat(body: ChatBody):
    url = await get_ollama_url()
    if not url:
        return {"reply": "__OLLAMA_DOWN__"}
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            res = await client.post(
                f"{url}/api/chat",
                json={"model": body.model, "messages": body.messages, "stream": False}
            )
            if res.status_code == 200:
                return {"reply": res.json().get("message", {}).get("content", "No response.")}
            return {"reply": f"Model error: {res.status_code} - try a different model"}
    except httpx.TimeoutException:
        return {"reply": "Model is taking too long — try a smaller model like gemma3:4b"}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}