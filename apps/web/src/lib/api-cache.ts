/**
 * Application-level API caching utility.
 * Use this to cache GET requests in memory so that rapid UI navigation
 * (like switching tabs) does not repeatedly hammer the server.
 * 
 * - The cache is completely wiped upon a hard browser reload, guaranteeing fresh data.
 * - Call `clearApiCache(url)` after mutations to ensure the UI instantly reflects changes.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export async function fetchWithCache<T = any>(url: string, ttlMs: number = 60000 * 2, forceReload: boolean = false): Promise<T> { //60000 - 1min
  const now = Date.now();
  const cached = cache.get(url);

  if (!forceReload && cached && (now - cached.timestamp < ttlMs)) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const data = await res.json();

  cache.set(url, { data, timestamp: now });
  return data;
}

export function clearApiCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}
