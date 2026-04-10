SOURCES = [
    # ── English — no translation needed ─────────────────────────────────────
    {
        "id": "bangkokpost",
        "name": "Bangkok Post",
        "rss": "https://www.bangkokpost.com/rss/data/topstories.xml",
        "lang": "en",
        "color": "#c0392b",
    },
    {
        "id": "bangkokpost_breaking",
        "name": "Bangkok Post Breaking",
        "rss": "https://www.bangkokpost.com/rss/data/breakingnews.xml",
        "lang": "en",
        "color": "#c0392b",
    },
    {
        "id": "thaipbs_world",
        "name": "Thai PBS World",
        "rss": "https://www.thaipbsworld.com/feed/",
        "lang": "en",
        "color": "#2980b9",
    },
    {
        "id": "nation",
        "name": "Nation Thailand",
        "rss": "https://www.nationthailand.com/rss/news",
        "lang": "en",
        "color": "#e67e22",
    },
    {
        "id": "prachatai_en",
        "name": "Prachatai English",
        "rss": "https://prachatai.com/english/rss.xml",
        "lang": "en",
        "color": "#8e44ad",
    },
    # ── Thai — translated ────────────────────────────────────────────────────
    {
        "id": "thairath",
        "name": "Thairath",
        "rss": "https://www.thairath.co.th/rss/news.xml",
        "lang": "th",
        "color": "#e74c3c",
    },
    {
        "id": "khaosod",
        "name": "Khaosod",
        "rss": "https://www.khaosod.co.th/rss",
        "lang": "th",
        "color": "#f39c12",
    },
    {
        "id": "matichon",
        "name": "Matichon",
        "rss": "https://www.matichon.co.th/feed",
        "lang": "th",
        "color": "#27ae60",
    },
    {
        "id": "springnews",
        "name": "Spring News",
        "rss": "https://www.springnews.co.th/feed",
        "lang": "th",
        "color": "#16a085",
    },
    {
        "id": "sanook",
        "name": "Sanook News",
        "rss": "https://www.sanook.com/news/rss/",
        "lang": "th",
        "color": "#9b59b6",
    },
    {
        "id": "posttoday",
        "name": "Post Today",
        "rss": "https://www.posttoday.com/rss/src/breaking.xml",
        "lang": "th",
        "color": "#2c3e50",
    },
    {
        "id": "prachatai",
        "name": "Prachatai",
        "rss": "https://prachatai.com/feed",
        "lang": "th",
        "color": "#7f8c8d",
    },
    {
        "id": "pptv",
        "name": "PPTV",
        "rss": "https://www.pptvhd36.com/rss",
        "lang": "th",
        "color": "#1abc9c",
    },
    {
        "id": "tnn",
        "name": "TNN Online",
        "rss": "https://www.tnnthailand.com/feed/",
        "lang": "th",
        "color": "#3498db",
    },
    {
        "id": "amarin",
        "name": "Amarin TV",
        "rss": "https://www.amarintv.com/feed",
        "lang": "th",
        "color": "#e91e63",
    },
    {
        "id": "ch3",
        "name": "Channel 3",
        "rss": "https://www.ch3thailand.com/feed",
        "lang": "th",
        "color": "#ff5722",
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
