import type { Article, ArticlesResponse, Category, Source, Status } from "../types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchArticles(params: {
  category?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ArticlesResponse> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.source) q.set("source", params.source);
  if (params.search) q.set("search", params.search);
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.offset != null) q.set("offset", String(params.offset));
  return get<ArticlesResponse>(`/articles?${q}`);
}

export async function fetchSources(): Promise<Source[]> {
  return get<Source[]>("/sources");
}

export async function fetchCategories(): Promise<Category[]> {
  return get<Category[]>("/categories");
}

export async function fetchStatus(): Promise<Status> {
  return get<Status>("/status");
}

export async function triggerRefresh(): Promise<void> {
  await fetch(`${BASE}/refresh`, { method: "POST" });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
