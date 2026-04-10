export interface Article {
  id: string;
  source_id: string;
  source_name: string;
  source_color: string;
  title_orig: string;
  title_en: string;
  summary_orig: string;
  summary_en: string;
  url: string;
  image_url: string;
  category: string;
  lang: string;
  translated: number;
  published_at: string;
  fetched_at: string;
}

export interface Source {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  category: string;
  count: number;
}

export interface ArticlesResponse {
  total: number;
  limit: number;
  offset: number;
  articles: Article[];
}

export interface Status {
  last_refresh: string;
  article_count: number;
  refresh_interval: number;
}
