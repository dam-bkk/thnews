import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { timeAgo } from "../api/client";
export default function ArticleModal({ article, onClose, dark = false, }) {
    const [phase, setPhase] = useState("loading");
    const [paragraphs, setParagraphs] = useState([]);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [showOrig, setShowOrig] = useState(false);
    const [error, setError] = useState("");
    const esRef = useRef(null);
    useEffect(() => {
        const url = `/api/article/stream?url=${encodeURIComponent(article.url)}&lang=${article.lang}`;
        const es = new EventSource(url);
        esRef.current = es;
        es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "start") {
                setPhase("streaming");
                setProgress({ done: 0, total: data.total });
            }
            else if (data.type === "chunk") {
                setParagraphs(prev => [...prev, { orig: data.orig, text: data.text }]);
                setProgress({ done: data.index + 1, total: data.total });
            }
            else if (data.type === "done") {
                setPhase("done");
                es.close();
            }
            else if (data.type === "error") {
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
        const handler = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    const isTranslated = article.lang !== "en";
    return (_jsxs("div", { onClick: onClose, style: {
            position: "fixed", inset: 0, zIndex: 1000,
            background: dark ? "rgba(0,0,0,.6)" : "rgba(10,10,10,.22)",
            backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
        }, children: [_jsxs("div", { onClick: e => e.stopPropagation(), style: {
                    background: "var(--bg-card)",
                    backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                    borderRadius: 20, border: "1px solid var(--border)",
                    boxShadow: dark ? "0 40px 80px rgba(0,0,0,.55)" : "0 24px 60px rgba(0,0,0,.12)",
                    width: "100%", maxWidth: 760, maxHeight: "90vh",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    fontFamily: "'Inter', sans-serif",
                }, children: [_jsxs("div", { style: { padding: "20px 22px 16px", borderBottom: "1px solid var(--divider)", display: "flex", flexDirection: "column", gap: 10 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [_jsx("span", { style: {
                                                    fontSize: 11, fontWeight: 600, color: "#fff",
                                                    background: article.source_color, borderRadius: 4, padding: "2px 7px",
                                                }, children: article.source_name }), _jsx("span", { style: { fontSize: 11, color: "var(--text-faint)" }, children: timeAgo(article.published_at) })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [_jsxs("a", { href: article.url, target: "_blank", rel: "noopener noreferrer", style: {
                                                    display: "flex", alignItems: "center", gap: 5,
                                                    background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8,
                                                    color: "var(--text-muted)", fontSize: 12, fontWeight: 600, padding: "6px 12px", textDecoration: "none",
                                                    fontFamily: "'Inter', sans-serif",
                                                }, children: [_jsx(ExternalLink, { size: 12 }), " Source"] }), _jsx("button", { onClick: onClose, style: {
                                                    background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8,
                                                    color: "var(--text-muted)", cursor: "pointer", padding: "6px 8px", display: "flex",
                                                }, children: _jsx(X, { size: 14 }) })] })] }), _jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.4, letterSpacing: "-.3px" }, children: article.title_en }), isTranslated && article.title_orig !== article.title_en && (_jsx("p", { style: { margin: 0, fontSize: 12, color: "#555", fontStyle: "italic" }, children: article.title_orig }))] }), isTranslated && (_jsx("div", { style: { padding: "8px 20px", borderBottom: "1px solid var(--divider)", display: "flex", gap: 6 }, children: ["EN", "Thai"].map((label, i) => (_jsx("button", { onClick: () => setShowOrig(i === 1), style: {
                                fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                                border: "1px solid " + ((showOrig ? i === 1 : i === 0) ? "var(--text)" : "var(--border)"),
                                background: (showOrig ? i === 1 : i === 0) ? "var(--text)" : "var(--bg-input)",
                                color: (showOrig ? i === 1 : i === 0) ? "var(--bg)" : "var(--text-muted)",
                                fontFamily: "'Inter', sans-serif",
                                cursor: "pointer",
                            }, children: label }, label))) })), (phase === "loading" || phase === "streaming") && (_jsxs("div", { style: { padding: "10px 20px 0", display: "flex", flexDirection: "column", gap: 6 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("span", { style: { fontSize: 11, color: "var(--text-muted)" }, children: phase === "loading"
                                            ? "Fetching article…"
                                            : isTranslated
                                                ? `Translating… ${progress.done} / ${progress.total} paragraphs`
                                                : `Loading… ${progress.done} / ${progress.total} paragraphs` }), _jsxs("span", { style: { fontSize: 11, color: "var(--text-faint)" }, children: [pct, "%"] })] }), _jsx("div", { style: { height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }, children: _jsx("div", { style: {
                                        height: "100%", borderRadius: 2,
                                        background: article.source_color,
                                        width: phase === "loading" ? "0%" : `${pct}%`,
                                        transition: "width 0.4s ease",
                                    } }) })] })), _jsx("div", { style: { padding: "16px 20px 20px", overflowY: "auto", flex: 1 }, children: phase === "error" ? (_jsx("p", { style: { color: "#666", fontSize: 13 }, children: error || "Could not load article." })) : paragraphs.length === 0 && phase === "loading" ? (_jsx("p", { style: { color: "#444", fontSize: 13 }, children: "Loading\u2026" })) : (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [paragraphs.map((p, i) => (_jsx("p", { style: {
                                        margin: 0, fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 400,
                                        wordBreak: "break-word",
                                        animation: "fadeIn 0.3s ease",
                                    }, children: showOrig ? p.orig : p.text }, i))), phase === "streaming" && (_jsxs("div", { style: { display: "flex", gap: 4, alignItems: "center", paddingTop: 4 }, children: [_jsx("span", { style: { width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite" } }), _jsx("span", { style: { width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite 0.2s" } }), _jsx("span", { style: { width: 6, height: 6, borderRadius: "50%", background: article.source_color, animation: "pulse 1s infinite 0.4s" } })] }))] })) })] }), _jsx("style", { children: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      ` })] }));
}
