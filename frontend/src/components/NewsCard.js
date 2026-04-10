import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { timeAgo } from "../api/client";
const CATEGORY_COLORS = {
    politics: "#dc2626",
    economy: "#16a34a",
    crime: "#7c3aed",
    sports: "#2563eb",
    entertainment: "#ea580c",
    health: "#0d9488",
    world: "#475569",
    tech: "#0891b2",
    society: "#6b7280",
    general: "#9ca3af",
};
export default function NewsCard({ article, onClick }) {
    const catColor = CATEGORY_COLORS[article.category] ?? "#9ca3af";
    return (_jsxs("div", { onClick: onClick, className: "news-card", children: [article.image_url && (_jsx("div", { className: "card-img-wrap", children: _jsx("img", { src: article.image_url, alt: "", className: "card-img", onError: e => { e.currentTarget.parentElement.style.display = "none"; } }) })), _jsxs("div", { className: "card-body", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }, children: [_jsx("span", { style: {
                                    fontSize: 10, fontWeight: 700, color: "#fff",
                                    background: article.source_color, borderRadius: 4,
                                    padding: "2px 7px", letterSpacing: ".04em", textTransform: "uppercase",
                                }, children: article.source_name }), _jsx("span", { style: { fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }, children: timeAgo(article.published_at) }), article.translated === 1 && (_jsx("span", { style: {
                                    fontSize: 9, fontWeight: 700, letterSpacing: ".05em",
                                    color: "#7c3aed", background: "rgba(124,58,237,.08)",
                                    border: "1px solid rgba(124,58,237,.2)", borderRadius: 4, padding: "1px 6px",
                                }, children: "TH\u2192EN" }))] }), _jsx("span", { style: {
                            alignSelf: "flex-start", fontSize: 9, fontWeight: 700,
                            color: catColor, background: `${catColor}14`,
                            borderRadius: 4, padding: "2px 7px",
                            textTransform: "uppercase", letterSpacing: ".06em",
                        }, children: article.category }), _jsx("p", { style: {
                            margin: 0, fontSize: 14, fontWeight: 700,
                            color: "var(--text)", lineHeight: 1.45, letterSpacing: "-.2px",
                        }, children: article.title_en }), article.summary_en && (_jsx("p", { style: {
                            margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6,
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                        }, children: article.summary_en }))] }), _jsx("style", { children: `
        .news-card {
          display: flex; flex-direction: column;
          background: var(--bg-card);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          border: 1px solid var(--border);
          transition: transform .4s cubic-bezier(.23,1,.32,1), box-shadow .4s ease, border-color .3s ease;
          will-change: transform;
        }
        .news-card:hover {
          transform: translateY(-6px) scale(1.012);
          box-shadow: 0 20px 50px rgba(0,0,0,.1);
          border-color: rgba(0,0,0,.14);
        }
        [data-theme="dark"] .news-card:hover {
          box-shadow: 0 20px 50px rgba(0,0,0,.4);
          border-color: rgba(255,255,255,.14);
        }
        .card-img-wrap { overflow: hidden; flex-shrink: 0; }
        .card-img { width: 100%; height: 155px; object-fit: cover; display: block; transition: transform .5s ease; }
        .news-card:hover .card-img { transform: scale(1.04); }
        .card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
      ` })] }));
}
