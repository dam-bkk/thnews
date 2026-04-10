import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import aiosqlite
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from .db import get_db
from .fetcher import fetch_all
from .scraper import stream_article
from .sources import SOURCES

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
REFRESH_INTERVAL = int(os.getenv("REFRESH_INTERVAL", "600"))

_db: aiosqlite.Connection | None = None
_scheduler = AsyncIOScheduler()
_last_refresh: str = ""
_article_count: int = 0


async def _upsert_articles(articles: list[dict]):
    global _article_count
    if not articles:
        return
    async with _db.executemany(
        """
        INSERT INTO articles
            (id, source_id, source_name, source_color,
             title_orig, title_en, summary_orig, summary_en,
             url, image_url, category, lang, translated, published_at, fetched_at)
        VALUES
            (:id, :source_id, :source_name, :source_color,
             :title_orig, :title_en, :summary_orig, :summary_en,
             :url, :image_url, :category, :lang, :translated, :published_at, :fetched_at)
        ON CONFLICT(id) DO UPDATE SET
            title_en    = excluded.title_en,
            summary_en  = excluded.summary_en,
            fetched_at  = excluded.fetched_at
        """,
        articles,
    ):
        pass
    await _db.commit()
    cur = await _db.execute("SELECT COUNT(*) FROM articles")
    row = await cur.fetchone()
    _article_count = row[0]


async def refresh_feeds():
    global _last_refresh
    articles = await fetch_all(YOUTUBE_API_KEY)
    await _upsert_articles(articles)
    _last_refresh = datetime.now(timezone.utc).isoformat()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _db
    _db = await get_db()
    # Start server immediately — first fetch runs in background
    _scheduler.add_job(refresh_feeds, "date")  # run once now
    _scheduler.add_job(refresh_feeds, "interval", seconds=REFRESH_INTERVAL)
    _scheduler.start()
    yield
    _scheduler.shutdown()
    await _db.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/articles")
async def get_articles(
    category: str = Query("all"),
    source: str = Query("all"),
    search: str = Query(""),
    limit: int = Query(40, le=100),
    offset: int = Query(0),
):
    conditions = []
    params: list = []

    if category != "all":
        conditions.append("category = ?")
        params.append(category)
    if source != "all":
        conditions.append("source_id = ?")
        params.append(source)
    if search:
        conditions.append("(title_en LIKE ? OR summary_en LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    count_row = await (
        await _db.execute(f"SELECT COUNT(*) FROM articles {where}", params)
    ).fetchone()
    total = count_row[0]

    rows = await (
        await _db.execute(
            f"SELECT * FROM articles {where} ORDER BY published_at DESC LIMIT ? OFFSET ?",
            params + [limit, offset],
        )
    ).fetchall()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "articles": [dict(r) for r in rows],
    }


@app.get("/api/sources")
async def get_sources():
    return [{"id": s["id"], "name": s["name"], "color": s["color"]} for s in SOURCES]


@app.get("/api/categories")
async def get_categories():
    rows = await (
        await _db.execute(
            "SELECT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY count DESC"
        )
    ).fetchall()
    return [dict(r) for r in rows]


@app.get("/api/status")
async def get_status():
    return {
        "last_refresh": _last_refresh,
        "article_count": _article_count,
        "refresh_interval": REFRESH_INTERVAL,
    }


@app.get("/api/article/stream")
async def stream_full_article(
    url: str = Query(...),
    lang: str = Query("th"),
    fallback: str = Query(""),
):
    return StreamingResponse(
        stream_article(url, lang, fallback=fallback),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/refresh")
async def manual_refresh():
    await refresh_feeds()
    return {"ok": True, "last_refresh": _last_refresh}


# Serve frontend — must be last so /api routes take priority
_public = os.path.join(os.path.dirname(__file__), "..", "public")
if os.path.isdir(_public):
    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        file = os.path.join(_public, full_path)
        if os.path.isfile(file):
            return FileResponse(file)
        return FileResponse(os.path.join(_public, "index.html"))

    app.mount("/assets", StaticFiles(directory=os.path.join(_public, "assets")), name="assets")
