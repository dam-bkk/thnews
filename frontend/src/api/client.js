const BASE = "/api";
async function get(path) {
    const r = await fetch(`${BASE}${path}`);
    if (!r.ok)
        throw new Error(`HTTP ${r.status}`);
    return r.json();
}
export async function fetchArticles(params) {
    const q = new URLSearchParams();
    if (params.category)
        q.set("category", params.category);
    if (params.source)
        q.set("source", params.source);
    if (params.search)
        q.set("search", params.search);
    if (params.limit != null)
        q.set("limit", String(params.limit));
    if (params.offset != null)
        q.set("offset", String(params.offset));
    return get(`/articles?${q}`);
}
export async function fetchSources() {
    return get("/sources");
}
export async function fetchCategories() {
    return get("/categories");
}
export async function fetchStatus() {
    return get("/status");
}
export async function triggerRefresh() {
    await fetch(`${BASE}/refresh`, { method: "POST" });
}
export function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)
        return "just now";
    if (m < 60)
        return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}
