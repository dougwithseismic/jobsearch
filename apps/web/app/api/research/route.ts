import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const CACHE_PATH = join(process.cwd(), "..", "..", "research-cache.json");

interface HNHit {
  title: string;
  url: string;
  points: number;
  num_comments: number;
  created_at: string;
  objectID: string;
}

interface CacheEntry {
  results: { title: string; url: string; points: number; numComments: number; createdAt: string }[];
  fetchedAt: number;
}

async function readCache(): Promise<Record<string, CacheEntry>> {
  try {
    const raw = await readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, CacheEntry>) {
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json({ error: "Missing company parameter" }, { status: 400 });
  }

  const cache = await readCache();

  if (cache[company]) {
    return NextResponse.json(cache[company]!.results);
  }

  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(company)}&tags=story&hitsPerPage=5`
    );
    const data = await res.json();

    const results = (data.hits as HNHit[]).map((hit) => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      numComments: hit.num_comments,
      createdAt: hit.created_at,
    }));

    cache[company] = { results, fetchedAt: Date.now() };
    await writeCache(cache);

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch HN data" }, { status: 500 });
  }
}
