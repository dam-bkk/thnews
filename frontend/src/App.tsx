import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Search, X, Moon, Sun } from "lucide-react";
import NewsCard from "./components/NewsCard";
import ArticleModal from "./components/ArticleModal";
import {
  fetchArticles, fetchCategories, fetchSources, fetchStatus, triggerRefresh,
} from "./api/client";
import type { Article, Category, Source, Status } from "./types";

const LIMIT = 40;

const CATEGORY_LABELS: Record<string, string> = {
  all: "All", politics: "Politics", economy: "Economy", crime: "Crime",
  sports: "Sports", entertainment: "Entertainment", health: "Health",
  world: "World", tech: "Tech", society: "Society", general: "General",
};

export default function App() {
  const [articles, setArticles]       = useState<Article[]>([]);
  const [total, setTotal]             = useState(0);
  const [sources, setSources]         = useState<Source[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [status, setStatus]           = useState<Status | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [dark, setDark]               = useState(false);

  const [category, setCategory]       = useState("all");
  const [source, setSource]           = useState("all");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [offset, setOffset]           = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const off = reset ? 0 : offset;
      const res = await fetchArticles({ category, source, search, limit: LIMIT, offset: off });
      setTotal(res.total);
      if (reset) { setArticles(res.articles); setOffset(0); }
      else        { setArticles(prev => [...prev, ...res.articles]); }
    } finally { setLoading(false); }
  }, [category, source, search, offset]);

  useEffect(() => { load(true); }, [category, source, search]); // eslint-disable-line

  useEffect(() => {
    fetchSources().then(setSources);
    fetchCategories().then(setCategories);
    fetchStatus().then(setStatus);
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      await triggerRefresh();
      fetchStatus().then(setStatus);
      fetchCategories().then(setCategories);
      load(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await triggerRefresh();
    const [s, c] = await Promise.all([fetchStatus(), fetchCategories()]);
    setStatus(s); setCategories(c);
    await load(true);
    setRefreshing(false);
  };

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  const handleLoadMore = () => { setOffset(offset + LIMIT); };
  useEffect(() => { if (offset > 0) load(false); }, [offset]); // eslint-disable-line

  const hasMore = articles.length < total;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif", position: "relative", paddingTop: 54 }}>

      {/* Liquid blobs */}
      <div className="liquid">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="blob blob-5" />
      </div>
      <div className="liquid-frost" />

      {/* Nav */}
      <nav>
        <div className="nav-logo">
          <div className="nav-logo-dot" />
          🇹🇭 Thai News
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {status && (
            <span className="nav-article-count">{status.article_count} articles</span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="nav-btn"
          >
            <RefreshCw size={12} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            <span>Refresh</span>
          </button>
          <div className="toggle-wrap">
            <button
              onClick={() => setDark(d => !d)}
              className="nav-btn"
              style={{ padding: "5px 8px" }}
              title="Toggle dark mode"
            >
              {dark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Category + search bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 auto" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Search…"
            className="search-input"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); setSearch(""); }}
              style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 0, display: "flex" }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Source */}
        <select value={source} onChange={e => setSource(e.target.value)} className="source-select">
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {/* Category pills */}
        <div className="cat-pills">
          {["all", ...categories.map(c => c.category)].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`cat-pill${category === cat ? " active" : ""}`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
              {cat !== "all" && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .5 }}>
                  {categories.find(c => c.category === cat)?.count ?? ""}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <main className="feed">
        {loading && articles.length === 0 ? (
          <div className="empty-state">Loading feeds…</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">No articles found.</div>
        ) : (
          <>
            <div className="grid">
              {articles.map(a => <NewsCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} />)}
            </div>
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 36 }}>
                <button onClick={handleLoadMore} disabled={loading} className="load-more-btn">
                  {loading ? "Loading…" : `Load more (${total - articles.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} dark={dark} />
      )}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }

        :root {
          --bg:          #eeecea;
          --bg-nav:      rgba(238,236,234,.82);
          --bg-card:     rgba(255,255,255,.72);
          --bg-input:    rgba(0,0,0,.04);
          --text:        #0a0a0a;
          --text-muted:  rgba(10,10,10,.42);
          --text-faint:  rgba(10,10,10,.24);
          --border:      rgba(0,0,0,.08);
          --border-nav:  rgba(0,0,0,.07);
          --divider:     rgba(0,0,0,.07);
        }
        [data-theme="dark"] {
          --bg:          #080810;
          --bg-nav:      rgba(8,8,16,.84);
          --bg-card:     rgba(22,22,34,.72);
          --bg-input:    rgba(255,255,255,.06);
          --text:        #f0f0f0;
          --text-muted:  rgba(240,240,240,.4);
          --text-faint:  rgba(240,240,240,.2);
          --border:      rgba(255,255,255,.08);
          --border-nav:  rgba(255,255,255,.06);
          --divider:     rgba(255,255,255,.07);
        }

        body { background: var(--bg); color: var(--text); transition: background .4s ease, color .3s ease; }

        /* Liquid blobs */
        .liquid { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); will-change: transform; mix-blend-mode: multiply; }
        [data-theme="dark"] .blob { mix-blend-mode: screen; }

        .blob-1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(139,92,246,.28) 0%, transparent 70%); top: -200px; left: -150px; animation: bl1 24s ease-in-out infinite alternate; }
        .blob-2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%); top: 10%; right: -120px; animation: bl2 30s ease-in-out infinite alternate; }
        .blob-3 { width: 540px; height: 540px; background: radial-gradient(circle, rgba(249,115,22,.18) 0%, transparent 70%); bottom: -160px; left: 30%; animation: bl3 21s ease-in-out infinite alternate; }
        .blob-4 { width: 460px; height: 460px; background: radial-gradient(circle, rgba(16,185,129,.16) 0%, transparent 70%); bottom: 20%; left: -100px; animation: bl4 27s ease-in-out infinite alternate; }
        .blob-5 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(236,72,153,.14) 0%, transparent 70%); top: 40%; right: 20%; animation: bl5 33s ease-in-out infinite alternate; }

        .liquid-frost {
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          background: linear-gradient(135deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.06) 100%);
        }
        [data-theme="dark"] .liquid-frost {
          background: linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 100%);
        }

        @keyframes bl1 { to { transform: translate(140px, 120px) scale(1.18); } }
        @keyframes bl2 { to { transform: translate(-120px, 140px) scale(.85); } }
        @keyframes bl3 { to { transform: translate(100px, -100px) scale(1.25); } }
        @keyframes bl4 { to { transform: translate(120px, -80px) scale(1.1); } }
        @keyframes bl5 { to { transform: translate(-90px, 110px) scale(.9); } }

        /* Nav */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 54px;
          background: var(--bg-nav);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-nav);
          transition: background .3s ease, border-color .3s ease;
        }
        .nav-logo { font-size: 13.5px; font-weight: 700; letter-spacing: -.2px; color: var(--text); display: flex; align-items: center; gap: 8px; }
        .nav-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text); flex-shrink: 0; }
        .nav-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--bg-input); color: var(--text-muted);
          font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: background .2s ease, color .2s ease;
        }
        .nav-btn:hover { background: var(--border); color: var(--text); }
        .nav-article-count { font-size: 11px; font-weight: 500; color: var(--text-muted); }
        .toggle-wrap { padding-left: 10px; border-left: 1px solid var(--border); }

        /* Filter bar */
        .filter-bar {
          position: sticky; top: 54px; z-index: 100;
          display: flex; align-items: center; gap: 8px;
          padding: 8px 24px; flex-wrap: wrap;
          background: var(--bg-nav);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-nav);
          transition: background .3s ease;
        }
        .search-input {
          background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px;
          padding: 7px 30px 7px 30px; color: var(--text); font-size: 13px; font-family: 'Inter', sans-serif;
          outline: none; width: 180px; transition: border-color .2s ease, background .2s ease;
        }
        .search-input:focus { border-color: rgba(59,130,246,.4); background: var(--bg-card); }
        .search-input::placeholder { color: var(--text-faint); }
        .source-select {
          background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px;
          padding: 7px 10px; color: var(--text); font-size: 12px; font-family: 'Inter', sans-serif;
          outline: none; cursor: pointer; max-width: 130px;
        }
        .cat-pills {
          display: flex; gap: 5px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; flex: 1;
        }
        .cat-pills::-webkit-scrollbar { display: none; }
        .cat-pill {
          padding: 5px 14px; border-radius: 100px; border: 1px solid var(--border);
          background: var(--bg-input); color: var(--text-muted);
          font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer; white-space: nowrap; transition: all .2s ease; flex-shrink: 0;
        }
        .cat-pill:hover { border-color: rgba(59,130,246,.3); color: var(--text); }
        .cat-pill.active { background: var(--text); color: var(--bg); border-color: var(--text); }

        /* Feed */
        .feed { padding: 24px; max-width: 1440px; margin: 0 auto; position: relative; z-index: 2; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .empty-state { text-align: center; color: var(--text-faint); padding: 100px 0; font-size: 14px; font-weight: 500; }
        .load-more-btn {
          background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px;
          padding: 12px 32px; color: var(--text-muted);
          font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }
        .load-more-btn:hover { background: var(--border); color: var(--text); }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          nav { padding: 0 16px; }
          .nav-article-count { display: none; }
          .nav-btn span { display: none; }

          .filter-bar { padding: 8px 16px; gap: 8px; flex-wrap: nowrap; overflow-x: auto; }
          .search-input { width: 130px; font-size: 13px; }
          .source-select { max-width: 100px; font-size: 12px; }
          .cat-pills { flex: none; }

          .feed { padding: 14px; }
          .grid { grid-template-columns: 1fr; gap: 12px; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
          .feed { padding: 18px; }
          .search-input { width: 150px; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        select option { background: var(--bg); color: var(--text); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
