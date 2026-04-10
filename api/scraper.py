import asyncio
import json
import re
from typing import AsyncGenerator
import httpx
import trafilatura
from .translator import translate

# cache scraped raw text: url -> str
_body_cache: dict[str, str] = {}

_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
    # No Accept-Encoding: some Thai sites return unextractable compressed responses
}


def _fetch_and_extract(url: str) -> str:
    try:
        with httpx.Client(
            timeout=20,
            headers=_FETCH_HEADERS,
            follow_redirects=True,
        ) as client:
            r = client.get(url)
            r.raise_for_status()
            html = r.text
    except Exception:
        # Fallback to trafilatura's own fetcher
        html = trafilatura.fetch_url(url)
        if not html:
            return ""

    text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
        favor_precision=False,
        favor_recall=True,
    )
    return text or ""


_TRANSLATE_LIMIT = 1500  # Google mobile endpoint handles up to ~2000 chars


def _split_paragraphs(text: str) -> list[str]:
    """Split trafilatura output into translate-safe chunks."""
    # Trafilatura uses single \n between paragraphs — treat every non-empty line as a paragraph
    raw = [l.strip() for l in text.splitlines() if l.strip() and len(l.strip()) > 3]

    # Further chunk any line that exceeds the translate limit
    import re
    result = []
    for line in raw:
        if len(line) <= _TRANSLATE_LIMIT:
            result.append(line)
        else:
            # Split on punctuation — Thai ๆ/ฯ have no following space so use \s* not \s+
            parts = re.split(r'(?<=[.!?\u0e46\u0e2f\u104a\u104b])\s*', line)
            chunk = ""
            for part in parts:
                if not part:
                    continue
                if len(chunk) + len(part) > _TRANSLATE_LIMIT:
                    if chunk:
                        result.append(chunk.strip())
                    # Hard-cut if a single part still exceeds limit
                    while len(part) > _TRANSLATE_LIMIT:
                        result.append(part[:_TRANSLATE_LIMIT])
                        part = part[_TRANSLATE_LIMIT:]
                    chunk = part
                else:
                    chunk = chunk + part if chunk else part
            if chunk:
                result.append(chunk.strip())
    return result


async def _get_body(url: str) -> str:
    if url in _body_cache:
        return _body_cache[url]
    loop = asyncio.get_event_loop()
    try:
        body = await asyncio.wait_for(
            loop.run_in_executor(None, _fetch_and_extract, url),
            timeout=20,
        )
    except Exception:
        body = ""
    _body_cache[url] = body
    return body


async def stream_article(url: str, lang: str) -> AsyncGenerator[str, None]:
    """Yield SSE events: start → chunk (per paragraph) → done."""

    def event(data: dict) -> str:
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

    body_orig = await _get_body(url)
    if not body_orig:
        yield event({"type": "error", "message": "Could not extract article content."})
        return

    paragraphs = _split_paragraphs(body_orig)
    total = len(paragraphs)

    yield event({"type": "start", "total": total, "lang": lang})

    for i, para in enumerate(paragraphs):
        translated = await translate(para, lang) if lang != "en" else para
        yield event({"type": "chunk", "index": i, "total": total, "orig": para, "text": translated})

    yield event({"type": "done", "total": total})
