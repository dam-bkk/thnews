import aiosqlite
import os

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "news.db"))

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS articles (
    id          TEXT PRIMARY KEY,
    source_id   TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_color TEXT NOT NULL DEFAULT '#555',
    title_orig  TEXT NOT NULL,
    title_en    TEXT NOT NULL,
    summary_orig TEXT NOT NULL DEFAULT '',
    summary_en  TEXT NOT NULL DEFAULT '',
    url         TEXT NOT NULL UNIQUE,
    image_url   TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'general',
    lang        TEXT NOT NULL DEFAULT 'th',
    translated  INTEGER NOT NULL DEFAULT 0,
    published_at TEXT NOT NULL,
    fetched_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_source    ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_category  ON articles(category);
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.executescript(CREATE_SQL)
    await db.commit()
    return db


async def close_db(db: aiosqlite.Connection):
    await db.close()
