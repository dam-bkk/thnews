import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Search, X, Moon, Sun } from "lucide-react";
import NewsCard from "./components/NewsCard";
import ArticleModal from "./components/ArticleModal";
import { fetchArticles, fetchCategories, fetchSources, fetchStatus, triggerRefresh, } from "./api/client";
const LIMIT = 40;
const CATEGORY_LABELS = {
    all: "All", politics: "Politics", economy: "Economy", crime: "Crime",
    sports: "Sports", entertainment: "Entertainment", health: "Health",
    world: "World", tech: "Tech", society: "Society", general: "General",
};
export default function App() {
    const [articles, setArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [sources, setSources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dark, setDark] = useState(false);
    const [category, setCategory] = useState("all");
    const [source, setSource] = useState("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [offset, setOffset] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const searchTimer = useRef(null);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    }, [dark]);
    const load = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const off = reset ? 0 : offset;
            const res = await fetchArticles({ category, source, search, limit: LIMIT, offset: off });
            setTotal(res.total);
            if (reset) {
                setArticles(res.articles);
                setOffset(0);
            }
            else {
                setArticles(prev => [...prev, ...res.articles]);
            }
        }
        finally {
            setLoading(false);
        }
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
        setStatus(s);
        setCategories(c);
        await load(true);
        setRefreshing(false);
    };
    const handleSearchInput = (val) => {
        setSearchInput(val);
        if (searchTimer.current)
            clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(val), 400);
    };
    const handleLoadMore = () => { setOffset(offset + LIMIT); };
    useEffect(() => { if (offset > 0)
        load(false); }, [offset]); // eslint-disable-line
    const hasMore = articles.length < total;
    return (_jsxs("div", { style: { minHeight: "100vh", fontFamily: "'Inter', sans-serif", position: "relative", paddingTop: 54 }, children: [_jsxs("div", { className: "liquid", children: [_jsx("div", { className: "blob blob-1" }), _jsx("div", { className: "blob blob-2" }), _jsx("div", { className: "blob blob-3" }), _jsx("div", { className: "blob blob-4" }), _jsx("div", { className: "blob blob-5" })] }), _jsx("div", { className: "liquid-frost" }), _jsxs("nav", { children: [_jsxs("div", { className: "nav-logo", children: [_jsx("div", { className: "nav-logo-dot" }), "\uD83C\uDDF9\uD83C\uDDED Thai News"] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [status && (_jsxs("span", { className: "nav-article-count", children: [status.article_count, " articles"] })), _jsxs("button", { onClick: handleManualRefresh, disabled: refreshing, className: "nav-btn", children: [_jsx(RefreshCw, { size: 12, style: { animation: refreshing ? "spin 1s linear infinite" : "none" } }), _jsx("span", { children: "Refresh" })] }), _jsx("div", { className: "toggle-wrap", children: _jsx("button", { onClick: () => setDark(d => !d), className: "nav-btn", style: { padding: "5px 8px" }, title: "Toggle dark mode", children: dark ? _jsx(Sun, { size: 13 }) : _jsx(Moon, { size: 13 }) }) })] })] }), _jsxs("div", { className: "filter-bar", children: [_jsxs("div", { style: { position: "relative", flex: "0 0 auto" }, children: [_jsx(Search, { size: 13, style: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" } }), _jsx("input", { value: searchInput, onChange: e => handleSearchInput(e.target.value), placeholder: "Search\u2026", className: "search-input" }), searchInput && (_jsx("button", { onClick: () => { setSearchInput(""); setSearch(""); }, style: { position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 0, display: "flex" }, children: _jsx(X, { size: 12 }) }))] }), _jsxs("select", { value: source, onChange: e => setSource(e.target.value), className: "source-select", children: [_jsx("option", { value: "all", children: "All Sources" }), sources.map(s => _jsx("option", { value: s.id, children: s.name }, s.id))] }), _jsx("div", { className: "cat-pills", children: ["all", ...categories.map(c => c.category)].map(cat => (_jsxs("button", { onClick: () => setCategory(cat), className: `cat-pill${category === cat ? " active" : ""}`, children: [CATEGORY_LABELS[cat] ?? cat, cat !== "all" && (_jsx("span", { style: { marginLeft: 4, fontSize: 10, opacity: .5 }, children: categories.find(c => c.category === cat)?.count ?? "" }))] }, cat))) })] }), _jsx("main", { className: "feed", children: loading && articles.length === 0 ? (_jsx("div", { className: "empty-state", children: "Loading feeds\u2026" })) : articles.length === 0 ? (_jsx("div", { className: "empty-state", children: "No articles found." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid", children: articles.map(a => _jsx(NewsCard, { article: a, onClick: () => setSelectedArticle(a) }, a.id)) }), hasMore && (_jsx("div", { style: { textAlign: "center", marginTop: 36 }, children: _jsx("button", { onClick: handleLoadMore, disabled: loading, className: "load-more-btn", children: loading ? "Loading…" : `Load more (${total - articles.length} remaining)` }) }))] })) }), selectedArticle && (_jsx(ArticleModal, { article: selectedArticle, onClose: () => setSelectedArticle(null), dark: dark })), _jsx("style", { children: `
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
      ` })] }));
}
