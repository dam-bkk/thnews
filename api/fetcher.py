import asyncio
import hashlib
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import feedparser
import httpx

from .sources import SOURCES, YOUTUBE_CHANNELS, detect_category
from .translator import translate_article


def _md5(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()


def _extract_image(entry) -> str:
    """Try multiple RSS image locations."""
    # media:content
    media = getattr(entry, "media_content", None)
    if media and isinstance(media, list) and media[0].get("url"):
        return media[0]["url"]
    # enclosure
    enclosures = getattr(entry, "enclosures", [])
    for e in enclosures:
        if "image" in e.get("type", ""):
            return e.get("href", "")
    # media:thumbnail
    thumbnail = getattr(entry, "media_thumbnail", None)
    if thumbnail and isinstance(thumbnail, list) and thumbnail[0].get("url"):
        return thumbnail[0]["url"]
    # first <img> in content/summary
    content = ""
    if hasattr(entry, "content") and entry.content:
        content = entry.content[0].get("value", "")
    if not content:
        content = getattr(entry, "summary", "")
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    if match:
        return match.group(1)
    return ""


def _clean_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def _parse_date(entry) -> str:
    try:
        if hasattr(entry, "published"):
            dt = parsedate_to_datetime(entry.published)
            return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        pass
    return datetime.now(timezone.utc).isoformat()


def _fetch_feed_sync(url: str):
    # Use httpx to handle cross-domain redirects that feedparser can't follow
    try:
        r = httpx.get(url, follow_redirects=True, timeout=12,
                      headers={"User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)"})
        if r.status_code == 200:
            return feedparser.parse(r.text)
    except Exception:
        pass
    return feedparser.parse(url, request_headers={"User-Agent": "Mozilla/5.0"})


async def fetch_source(source: dict) -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        feed = await asyncio.wait_for(
            loop.run_in_executor(None, _fetch_feed_sync, source["rss"]),
            timeout=15,
        )
    except Exception:
        return []

    results = []
    for entry in feed.entries[:20]:
        url = getattr(entry, "link", "")
        if not url:
            continue
        title_orig = _clean_html(getattr(entry, "title", ""))
        summary_orig = _clean_html(getattr(entry, "summary", ""))
        if not title_orig:
            continue

        lang = source["lang"]
        title_en, summary_en = await translate_article(title_orig, summary_orig, lang)

        text_for_cat = f"{title_en} {summary_en}"
        rss_cats = [t.get("term", "") for t in getattr(entry, "tags", [])]
        category = detect_category(" ".join(rss_cats) + " " + text_for_cat)

        results.append({
            "id": _md5(url),
            "source_id": source["id"],
            "source_name": source["name"],
            "source_color": source["color"],
            "title_orig": title_orig,
            "title_en": title_en,
            "summary_orig": summary_orig,
            "summary_en": summary_en,
            "url": url,
            "image_url": _extract_image(entry),
            "category": category,
            "lang": lang,
            "translated": 0 if lang == "en" else 1,
            "published_at": _parse_date(entry),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        })
    return results


async def fetch_youtube_channel(channel_id: str, source: dict, api_key: str) -> list[dict]:
    url = (
        f"https://www.googleapis.com/youtube/v3/search"
        f"?key={api_key}&channelId={channel_id}&part=snippet&order=date&maxResults=10&type=video"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []

    results = []
    for item in data.get("items", []):
        snip = item.get("snippet", {})
        video_id = item.get("id", {}).get("videoId", "")
        if not video_id:
            continue
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        title_orig = snip.get("title", "")
        summary_orig = snip.get("description", "")[:500]
        lang = source["lang"]
        title_en, summary_en = await translate_article(title_orig, summary_orig, lang)

        results.append({
            "id": _md5(video_url),
            "source_id": f"yt_{source['id']}",
            "source_name": f"▶ {source['name']}",
            "source_color": source["color"],
            "title_orig": title_orig,
            "title_en": title_en,
            "summary_orig": summary_orig,
            "summary_en": summary_en,
            "url": video_url,
            "image_url": snip.get("thumbnails", {}).get("medium", {}).get("url", ""),
            "category": detect_category(f"{title_en} {summary_en}"),
            "lang": lang,
            "translated": 0 if lang == "en" else 1,
            "published_at": snip.get("publishedAt", datetime.now(timezone.utc).isoformat()),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        })
    return results


async def fetch_all(youtube_api_key: str = "") -> list[dict]:
    tasks = [fetch_source(s) for s in SOURCES]
    results_nested = await asyncio.gather(*tasks, return_exceptions=True)
    articles = []
    for r in results_nested:
        if isinstance(r, list):
            articles.extend(r)

    if youtube_api_key:
        yt_tasks = [
            fetch_youtube_channel(ch["id"], ch, youtube_api_key)
            for ch in YOUTUBE_CHANNELS
        ]
        yt_results = await asyncio.gather(*yt_tasks, return_exceptions=True)
        for r in yt_results:
            if isinstance(r, list):
                articles.extend(r)

    return articles
