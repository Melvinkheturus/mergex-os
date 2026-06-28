"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";

interface ChangeLogItem {
  id: string;
  type: string; // "feature" | "improvement" | "fix"
  category: string;
  subcategory: string | null;
  description: string;
}

interface ChangeLog {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  type: string;
  popupTitle: string | null;
  popupDescription: string | null;
  items: ChangeLogItem[];
}

interface ReleaseAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: ChangeLog | null;
  onDismiss: () => void;
}

export function ReleaseAnnouncementModal({
  open,
  onOpenChange,
  release,
  onDismiss,
}: ReleaseAnnouncementModalProps) {
  if (!release) return null;

  const title = release.popupTitle || `🚀 MergeX OS Updated`;
  const desc = release.popupDescription || release.description || `Explore the new features, improvements, and bug fixes in version ${release.version}.`;

  // Group items by type for clean display
  const features = release.items.filter((item) => item.type === "feature");
  const improvements = release.items.filter((item) => item.type === "improvement");
  const fixes = release.items.filter((item) => item.type === "fix");

  const handleViewUpdate = () => {
    onDismiss();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-frost-card border-white/10 text-left bg-zinc-950/95 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Version {release.version}
            </span>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
              {release.type} Update
            </span>
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-white mt-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400 leading-relaxed font-semibold">
            {desc}
          </DialogDescription>
        </DialogHeader>

        {/* Highlights List */}
        <div className="my-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]/90 font-mono">
                New Features ({features.length})
              </h4>
              <ul className="space-y-1.5">
                {features.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold text-[9px] uppercase tracking-wider text-[#8B5CF6] mr-1.5 bg-[#8B5CF6]/5 px-1 py-0.5 rounded border border-[#8B5CF6]/10 font-mono">
                        {item.category}
                      </span>
                      <span className="text-neutral-200 font-semibold">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
                Improvements ({improvements.length})
              </h4>
              <ul className="space-y-1.5">
                {improvements.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-400 mr-1.5 bg-emerald-500/5 px-1 py-0.5 rounded border border-emerald-500/10 font-mono">
                        {item.category}
                      </span>
                      <span className="text-neutral-200 font-semibold">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fixes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                Bug Fixes ({fixes.length})
              </h4>
              <ul className="space-y-1.5">
                {fixes.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                    <div>
                      <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 mr-1.5 bg-white/5 px-1 py-0.5 rounded border border-white/10 font-mono">
                        {item.category}
                      </span>
                      <span className="text-neutral-200 font-semibold">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex sm:flex-row gap-2 justify-end pt-4 border-t border-white/5 bg-transparent -mx-6 -mb-6 p-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onDismiss}
            className="h-9 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer rounded-xl bg-transparent hover:bg-white/5"
          >
            Dismiss
          </Button>
          <Button
            asChild
            onClick={handleViewUpdate}
            className="h-9 text-xs font-bold bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white rounded-xl gap-1.5 cursor-pointer"
          >
            <Link href="/changelog" target="_blank">
              View Full Update
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
