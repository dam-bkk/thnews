import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Article } from "../types";
import { timeAgo } from "../api/client";

interface Paragraph {
  orig: string;
  text: string;
}

type Phase = "loading" | "streaming" | "done" | "error";

export default function ArticleModal({
  article,
  onClose,
  dark = false,
}: {
  article: Article;
  onClose: () => void;
  dark?: boolean;
}) {
  const [phase, setPhase]           = useState<Phase>("loading");
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [progress, setProgress]     = useState({ done: 0, total: 0 });
  const [showOrig, setShowOrig]     = useState(false);
  const [error, setError]           = useState("");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `/api/article/stream?url=${encodeURIComponent(article.url)}&lang=${article.lang}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "start") {
        setPhase("streaming");
        setProgress({ done: 0, total: data.total });
      } else if (data.type === "chunk") {
        setParagraphs(prev => [...prev, { orig: data.orig, text: data.text }]);
        setProgress({ done: data.index + 1, total: data.total });
      } else if (data.type === "done") {
        setPhase("done");
        es.close();
      } else if (data.type === "error") {
        setError(data.message);
        setPhase("error");
        es.close();
      }
    };

    es.onerror = () => {
      setPhase("done");
      es.close();
    };

    return () => { es.close(); };
  }, [article.url, article.lang]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const isTranslated = article.lang !== "en";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: dark ? "rgba(0,0,0,.6)" : "rgba(10,10,10,.22)",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: 20, border: "1px solid var(--border)",
          boxShadow: dark ? "0 40px 80px rgba(0,0,0,.55)" : "0 24px 60px rgba(0,0,0,.12)",
          width: "100%", maxWidth: 760, maxHeight: "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--divider)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: "#fff",
                background: article.source_color, borderRadius: 4, padding: "2px 7px",
              }}>
                {article.source_name}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{timeAgo(article.published_at)}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8,
                  color: "var(--text-muted)", fontSize: 12, fontWeight: 600, padding: "6px 12px", textDecoration: "none",
                  fontFamily: "'Inter', sans-serif",
                }}>
                <ExternalLink size={12} /> Source
              </a>
              <button onClick={onClose} style={{
                background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8,
                color: "var(--text-muted)", cursor: "pointer", padding: "6px 8px", display: "flex",
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.4, letterSpacing: "-.3px" }}>
            {article.title_en}
          </h2>
          {isTranslated && article.title_orig !== article.title_en && (
            <p style={{ margin: 0, fontSize: 12, color: "#555", fontStyle: "italic" }}>
              {article.title_orig}
            </p>
          )}
        </div>

        {/* EN / Thai toggle */}
        {isTranslated && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--divider)", display: "flex", gap: 6 }}>
            {["EN", "Thai"].map((label, i) => (
              <button key={label} onClick={() => setShowOrig(i === 1)} style={{
                fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                border: "1px solid " + ((showOrig ? i === 1 : i === 0) ? "var(--text)" : "var(--border)"),
                background: (showOrig ? i === 1 : i === 0) ? "var(--text)" : "var(--bg-input)",
                color: (showOrig ? i === 1 : i === 0) ? "var(--bg)" : "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
              }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {(phase === "loading" || phase === "streaming") && (
          <div style={{ padding: "10px 20px 0", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {phase === "loading"
                  ? "Fetching article…"
                  : isTranslated
                    ? `Translating… ${progress.done} / ${progress.total} paragraphs`
                    : `Loading… ${progress.done} / ${progress.total} paragraphs`}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: article.source_color,
                width: phase === "loading" ? "0%" : `${pct}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "16px 20px 20px", overflowY: "auto", flex: 1 }}>
          {phase === "error" ? (
            <p style={{ color: "#666", fontSize: 13 }}>{error || "Could not load article."}</p>
          ) : paragraphs.length === 0 && phase === "loading" ? (
            <p style={{ color: "#444", fontSize: 13 }}>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{
                  margin: 0, fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 400,
                  wordBreak: "break-word",
                  animation: "fadeIn 0.3s ease",
                }}>
                  {showOrig ? p.orig : p.text}
                </p>
              ))}
              {phase === "streaming" && (
                <div style={{ display: "flex", gap: 4, alignItems: "center", paddingTop: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite 0.2s" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite 0.4s" }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
