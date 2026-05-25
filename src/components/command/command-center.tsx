"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useCommandSearch } from "./use-command-search";
import { cn } from "@/lib/utils";
import {
  Zap,
  Search,
  Loader2,
  Clock,
  User,
  Building2,
  UserCircle,
  FileText,
  Video,
  CheckSquare,
  LayoutDashboard,
  Navigation,
  Plus,
  Trash2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { SearchResult } from "@/app/api/search/route";

// ── Entity icon map ──────────────────────────────────────────────────────────
const ENTITY_ICONS: Record<string, React.ElementType> = {
  lead:     TrendingUp,
  contact:  UserCircle,
  company:  Building2,
  meeting:  Video,
  proposal: FileText,
  task:     CheckSquare,
  user:     User,
  nav:      LayoutDashboard,
  action:   Plus,
};

const ENTITY_COLORS: Record<string, string> = {
  lead:     "text-violet-500 bg-violet-500/10",
  contact:  "text-blue-500 bg-blue-500/10",
  company:  "text-cyan-500 bg-cyan-500/10",
  meeting:  "text-indigo-500 bg-indigo-500/10",
  proposal: "text-orange-500 bg-orange-500/10",
  task:     "text-emerald-500 bg-emerald-500/10",
  user:     "text-pink-500 bg-pink-500/10",
  nav:      "text-muted-foreground bg-muted",
  action:   "text-primary bg-primary/10",
};

// ── Recent history item ──────────────────────────────────────────────────────
interface HistoryItem {
  id: string;
  entityType: string;
  title: string;
  href?: string | null;
}

// ── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ result }: { result: SearchResult }) {
  const Icon = ENTITY_ICONS[result.entityType] ?? Navigation;
  const colorClass = ENTITY_COLORS[result.entityType] ?? "text-muted-foreground bg-muted";

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={cn("flex items-center justify-center w-7 h-7 rounded-md shrink-0", colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate text-foreground leading-none">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{result.subtitle}</p>
        )}
      </div>
      {result.meta && (
        <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded shrink-0 capitalize">
          {result.meta.replace(/_/g, " ").toLowerCase()}
        </span>
      )}
      <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0 opacity-0 group-data-[selected=true]:opacity-100" />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
interface CommandCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandCenter({ open, onOpenChange }: CommandCenterProps) {
  const router = useRouter();
  const { query, setQuery, groups, isLoading, saveHistory } = useCommandSearch();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Fetch recent history when palette opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/search/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.items ?? []))
      .catch(() => {});
  }, [open]);

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery("");
  }, [open, setQuery]);

  const handleSelect = useCallback(
    async (result: SearchResult) => {
      onOpenChange(false);
      await saveHistory({
        entityType: result.entityType,
        entityId:   result.id,
        title:      result.title,
        href:       result.href,
      });
      if (result.href) router.push(result.href);
    },
    [onOpenChange, saveHistory, router]
  );

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch("/api/search/history", { method: "DELETE" });
    setHistory([]);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] animate-in fade-in-0 duration-150"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-[15%] -translate-x-1/2 z-[60] w-full max-w-xl px-4 animate-in fade-in-0 zoom-in-95 duration-150">
        <Command
          className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          shouldFilter={false}
          loop
        >
          {/* ── Search Input ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search or jump to…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none text-foreground"
              autoFocus
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border bg-muted">
                Esc
              </kbd>
            </div>
          </div>

          {/* ── Results ──────────────────────────────────────────────────── */}
          <Command.List className="max-h-[420px] overflow-y-auto overscroll-contain p-1.5">

            {/* Empty state */}
            <Command.Empty className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No results for</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">"{query}"</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Try a different search term</p>
            </Command.Empty>

            {/* Recent History — shown when no query */}
            {!query && history.length > 0 && (
              <Command.Group>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Recent
                  </p>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    Clear
                  </button>
                </div>
                {history.map((item) => {
                  const Icon = ENTITY_ICONS[item.entityType] ?? Navigation;
                  const colorClass = ENTITY_COLORS[item.entityType] ?? "text-muted-foreground bg-muted";
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() =>
                        handleSelect({
                          id:         item.id,
                          entityType: item.entityType,
                          title:      item.title,
                          href:       item.href ?? undefined,
                        })
                      }
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer group data-[selected=true]:bg-accent/60 transition-colors duration-100"
                    >
                      <div className={cn("flex items-center justify-center w-7 h-7 rounded-md shrink-0", colorClass)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-foreground truncate flex-1">{item.title}</p>
                      <Clock className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Live result groups */}
            {groups.map((group) => (
              <Command.Group key={group.type} className="mb-1">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {group.label}
                </p>
                {group.results.map((result) => (
                  <Command.Item
                    key={result.id}
                    value={`${result.entityType}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer group data-[selected=true]:bg-accent/60 transition-colors duration-100"
                  >
                    <ResultRow result={result} />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* ── Footer hint ──────────────────────────────────────────────── */}
          <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-border rounded px-1">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-border rounded px-1">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-border rounded px-1">Esc</kbd> close
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 text-primary" />
              Command Center
            </span>
          </div>
        </Command>
      </div>
    </>
  );
}
