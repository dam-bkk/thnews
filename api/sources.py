SOURCES = [
    # ── English — no translation needed ─────────────────────────────────────
    {
        "id": "coconuts_bkk",
        "name": "Coconuts Bangkok",
        "rss": "https://coconuts.co/bangkok/feed/",
        "lang": "en",
        "color": "#e67e22",
    },
    {
        "id": "khaosod_en",
        "name": "Khaosod English",
        "rss": "https://www.khaosodenglish.com/feed/",
        "lang": "en",
        "color": "#f39c12",
    },
    # ── Thai — translated ────────────────────────────────────────────────────
    {
        "id": "bbc_thai",
        "name": "BBC Thai",
        "rss": "https://feeds.bbci.co.uk/thai/rss.xml",
        "lang": "th",
        "color": "#c0392b",
    },
    {
        "id": "voa_thai",
        "name": "VOA Thai",
        "rss": "https://www.voathai.com/api/epiqq",
        "lang": "th",
        "color": "#2980b9",
    },
    {
        "id": "matichon",
        "name": "Matichon",
        "rss": "https://www.matichon.co.th/feed",
        "lang": "th",
        "color": "#27ae60",
    },
    {
        "id": "prachatai",
        "name": "Prachatai",
        "rss": "https://prachatai.com/feed",
        "lang": "th",
        "color": "#7f8c8d",
    },
]

# YouTube channel IDs (optional — needs YOUTUBE_API_KEY)
YOUTUBE_CHANNELS = [
    {"id": "UCzSFCTTAZQJQdoMM-qy5G2A", "name": "Thai PBS", "lang": "th", "color": "#2980b9"},
    {"id": "UCpIPBG7UXQrAtGUPMKMQoIg", "name": "Workpoint News", "lang": "th", "color": "#e74c3c"},
    {"id": "UCDm2VLxC8IYdyAJY36DlvzA", "name": "Nation TV", "lang": "th", "color": "#e67e22"},
    {"id": "UCJsSEDFFnMFHT_MoL_9TTMQ", "name": "Spring News TV", "lang": "th", "color": "#16a085"},
    {"id": "UCmlorCC0y9_aSEQkwp5j5kA", "name": "TNN Channel 16", "lang": "th", "color": "#3498db"},
]

CATEGORY_KEYWORDS = {
    "politics": [
        "politics", "government", "parliament", "minister", "election", "senate", "party",
        "การเมือง", "รัฐบาล", "นายกรัฐมนตรี", "รัฐสภา", "เลือกตั้ง", "พรรค", "กระทรวง",
    ],
    "economy": [
        "economy", "economic", "gdp", "bank", "stock", "trade", "baht", "investment", "market",
        "เศรษฐกิจ", "ธนาคาร", "หุ้น", "การลงทุน", "ตลาด", "เงิน", "บาท", "ราคา",
    ],
    "crime": [
        "crime", "arrest", "police", "murder", "drug", "stolen", "robbery", "prison",
        "อาชญากรรม", "จับกุม", "ตำรวจ", "ฆาตกรรม", "ยาเสพติด", "ขโมย", "คุก",
    ],
    "sports": [
        "sport", "football", "soccer", "tennis", "olympic", "match", "tournament",
        "กีฬา", "ฟุตบอล", "แข่งขัน", "นักกีฬา", "โอลิมปิก", "แชมป์",
    ],
    "entertainment": [
        "entertainment", "celebrity", "music", "film", "movie", "concert", "actor",
        "บันเทิง", "ดารา", "นักร้อง", "ภาพยนตร์", "เพลง", "ละคร", "คอนเสิร์ต",
    ],
    "health": [
        "health", "hospital", "disease", "covid", "virus", "medical", "vaccine", "cancer",
        "สุขภาพ", "โรงพยาบาล", "โรค", "ยา", "วัคซีน", "แพทย์", "ผู้ป่วย",
    ],
    "world": [
        "world", "international", "global", "foreign", "usa", "china", "europe", "war",
        "ต่างประเทศ", "นานาชาติ", "โลก", "สหรัฐ", "จีน", "สงคราม",
    ],
    "tech": [
        "technology", "digital", "ai", "software", "internet", "cyber", "app", "robot",
        "เทคโนโลยี", "ดิจิทัล", "ออนไลน์", "แอป", "อินเทอร์เน็ต",
    ],
    "society": [
        "society", "community", "education", "environment", "flood", "disaster",
        "สังคม", "ชุมชน", "การศึกษา", "สิ่งแวดล้อม", "น้ำท่วม", "ภัยพิบัติ",
    ],
}


def detect_category(text: str) -> str:
    text_lower = text.lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[cat] += 1
    best = max(scores, key=lambda c: scores[c])
    return best if scores[best] > 0 else "general"
