import asyncio
import hashlib
import logging
import re
import httpx

logger = logging.getLogger(__name__)

_cache: dict[str, str] = {}
_semaphore = asyncio.Semaphore(2)  # light concurrency

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "Accept-Language": "en-US,en;q=0.9",
}


def _clean(text: str) -> str:
    return " ".join(text.split()).replace("&nbsp;", " ").replace("&amp;", "&")


async def _call(text: str, source: str) -> str:
    url = "https://translate.google.com/m"
    params = {"sl": source, "tl": "en", "q": text}
    async with httpx.AsyncClient(timeout=12, headers=_HEADERS, follow_redirects=True) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        match = re.search(r'class="result-container">([^<]+)', r.text)
        if not match:
            raise ValueError("No translation in response")
        return match.group(1).strip()


async def translate(text: str, source: str = "th") -> str:
    if not text or not text.strip() or source == "en":
        return text
    cleaned = _clean(text)
    key = hashlib.md5(f"{source}:{cleaned}".encode()).hexdigest()
    if key in _cache:
        return _cache[key]

    async with _semaphore:
        if key in _cache:
            return _cache[key]
        for attempt in range(3):
            try:
                result = await _call(cleaned, source)
                if result:
                    _cache[key] = result
                    return result
            except Exception as e:
                wait = 1.5 ** attempt
                logger.warning(f"Translate attempt {attempt+1} failed: {e} — wait {wait:.1f}s")
                await asyncio.sleep(wait)
        logger.error(f"Translation gave up ({source}→en)")
        return text


async def translate_article(title: str, summary: str, lang: str) -> tuple[str, str]:
    if lang == "en":
        return title, summary
    t_title = await translate(title, lang)
    t_summary = await translate(summary[:500], lang) if summary else ""
    return t_title, t_summary
