"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SearchGroup } from "@/app/api/search/route";

const DEBOUNCE_MS = 200;

export function useCommandSearch() {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=5`,
        { signal: ctrl.signal }
      );
      if (!res.ok) return;
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const saveHistory = useCallback(
    async (result: {
      entityType: string;
      entityId?: string;
      title: string;
      href?: string;
    }) => {
      await fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, ...result }),
      });
    },
    [query]
  );

  return { query, setQuery, groups, isLoading, saveHistory };
}
