"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ChangeLogItem {
  id: string;
  changelogId: string;
  type: string; // "feature" | "improvement" | "fix"
  category: string;
  subcategory: string | null;
  description: string;
  createdAt: string;
}

interface ChangeLog {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  type: string;
  status: string;
  popupEnabled: boolean;
  popupTitle: string | null;
  popupDescription: string | null;
  createdAt: string;
  items: ChangeLogItem[];
}

export function ChangelogTimeline({ initialReleases }: { initialReleases: ChangeLog[] }) {
  return (
    <div className="space-y-6 w-full">
      {/* Table Headers (matching Image 3) */}
      <div className="hidden lg:grid grid-cols-4 gap-8 pb-3.5 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-neutral-400">
        <div className="col-span-1 pl-2">Version</div>
        <div className="col-span-3">Description</div>
      </div>

      {initialReleases.length === 0 ? (
        <div className="text-center py-20 bg-white/2 border border-white/5 rounded-2xl">
          <p className="text-sm font-semibold text-neutral-400">No releases published yet.</p>
        </div>
      ) : (
        /* List layout without timeline line/dots (matching Image 3) */
        <div className="space-y-10 pt-2 w-full">
          {initialReleases.map((release, index) => (
            <div key={release.id} className="relative group">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
                
                {/* Left Column: Version & Date (matching Image 3) */}
                <div className="lg:col-span-1 pl-2 text-left">
                  <h2 className="text-base font-bold text-white tracking-tight leading-none">
                    {release.version}
                  </h2>
                  <p className="text-[11px] text-neutral-500 mt-2 font-mono font-semibold">
                    {format(new Date(release.releaseDate), "MMMM d, yyyy")}
                  </p>
                </div>

                {/* Right Column: Card Details (matching Image 3) */}
                <div className="lg:col-span-3">
                  <ReleaseCard release={release} defaultExpanded={index === 0} />
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReleaseCard({ release, defaultExpanded }: { release: ChangeLog; defaultExpanded: boolean }) {
  // Map types to match Image 3 terminology:
  // "feature" -> Improvements
  // "improvement" -> Fixes
  // "fix" -> Patches
  const improvements = useMemo(() => release.items.filter((i) => i.type === "feature"), [release.items]);
  const fixes = useMemo(() => release.items.filter((i) => i.type === "improvement"), [release.items]);
  const patches = useMemo(() => release.items.filter((i) => i.type === "fix"), [release.items]);

  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-md hover:border-[#8B5CF6]/20 hover:bg-white/[0.03] transition-all duration-300 text-left">
      {/* Title & Short Description */}
      <h3 className="text-base font-bold text-white tracking-tight">{release.title}</h3>
      <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-semibold">{release.description}</p>

      {/* Accordion details flat list (matching Image 3) */}
      <div className="mt-5 space-y-1 pt-2">
        <AccordionSection title="Improvements" items={improvements} defaultExpanded={defaultExpanded && improvements.length > 0} />
        <AccordionSection title="Fixes" items={fixes} defaultExpanded={defaultExpanded && fixes.length > 0} />
        <AccordionSection title="Patches" items={patches} defaultExpanded={defaultExpanded && patches.length > 0} />
      </div>
    </div>
  );
}

function AccordionSection({
  title,
  items,
  defaultExpanded,
}: {
  title: string;
  items: ChangeLogItem[];
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-t border-white/5 py-3.5 first:border-t-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {title}
          <span className="text-[10px] font-mono text-neutral-500">
            ({items.length})
          </span>
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />}
      </button>

      {expanded && (
        <div className="pt-3 pb-1 space-y-2.5 animate-fade-in-up duration-150">
          {items.length === 0 ? (
            <p className="text-[10px] text-neutral-500 italic pl-1">No {title.toLowerCase()} in this release.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed pl-1">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#8B5CF6]/85 shrink-0" />
                  <div>
                    {/* Operational Category tag */}
                    <span className="font-bold text-[9px] uppercase tracking-wider text-[#8B5CF6] mr-1.5 bg-[#8B5CF6]/5 px-1.5 py-0.5 rounded border border-[#8B5CF6]/10 font-mono">
                      {item.category}
                      {item.subcategory ? ` • ${item.subcategory}` : ""}
                    </span>
                    <span className="text-[#D1D5DB] font-medium">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
