import asyncio
import json
import re
from typing import AsyncGenerator
import trafilatura
from .translator import translate

# cache scraped raw text: url -> str
_body_cache: dict[str, str] = {}


def _fetch_and_extract(url: str) -> str:
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        return ""
    text = trafilatura.extract(
        downloaded,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
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
