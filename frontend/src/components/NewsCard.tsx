import type { Article } from "../types";
import { timeAgo } from "../api/client";

const CATEGORY_COLORS: Record<string, string> = {
  politics:      "#dc2626",
  economy:       "#16a34a",
  crime:         "#7c3aed",
  sports:        "#2563eb",
  entertainment: "#ea580c",
  health:        "#0d9488",
  world:         "#475569",
  tech:          "#0891b2",
  society:       "#6b7280",
  general:       "#9ca3af",
};

export default function NewsCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const catColor = CATEGORY_COLORS[article.category] ?? "#9ca3af";

  return (
    <div onClick={onClick} className="news-card">
      {article.image_url && (
        <div className="card-img-wrap">
          <img
            src={article.image_url}
            alt=""
            className="card-img"
            onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className="card-body">
        {/* Source + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#fff",
            background: article.source_color, borderRadius: 4,
            padding: "2px 7px", letterSpacing: ".04em", textTransform: "uppercase",
          }}>
            {article.source_name}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }}>
            {timeAgo(article.published_at)}
          </span>
          {article.translated === 1 && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: ".05em",
              color: "#7c3aed", background: "rgba(124,58,237,.08)",
              border: "1px solid rgba(124,58,237,.2)", borderRadius: 4, padding: "1px 6px",
            }}>
              TH→EN
            </span>
          )}
        </div>

        {/* Category */}
        <span style={{
          alignSelf: "flex-start", fontSize: 9, fontWeight: 700,
          color: catColor, background: `${catColor}14`,
          borderRadius: 4, padding: "2px 7px",
          textTransform: "uppercase", letterSpacing: ".06em",
        }}>
          {article.category}
        </span>

        {/* Title */}
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 700,
          color: "var(--text)", lineHeight: 1.45, letterSpacing: "-.2px",
        }}>
          {article.title_en}
        </p>

        {/* Summary */}
        {article.summary_en && (
          <p style={{
            margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {article.summary_en}
          </p>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
