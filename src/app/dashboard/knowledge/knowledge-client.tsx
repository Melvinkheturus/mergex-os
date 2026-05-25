"use client";

import { useState } from "react";
import {
  BookOpen, Plus, Search, FileText, BookMarked,
  GraduationCap, Layout, Link2, Megaphone, Eye,
  Clock, Tag, Filter, MoreHorizontal, ChevronRight,
  Star, TrendingUp, Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentType = "PLAYBOOK" | "SOP" | "TRAINING" | "TEMPLATE" | "REFERENCE" | "ANNOUNCEMENT";
type DocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface Document {
  id: string;
  title: string;
  slug: string;
  type: DocumentType;
  status: DocumentStatus;
  excerpt?: string;
  tags: string[];
  viewCount: number;
  category?: { name: string; icon?: string };
  author: { firstName: string; lastName: string };
  publishedAt?: string;
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DOC_TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  PLAYBOOK:     { label: "Playbook",     icon: BookMarked,    color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  SOP:          { label: "SOP",          icon: FileText,      color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  TRAINING:     { label: "Training",     icon: GraduationCap, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  TEMPLATE:     { label: "Template",     icon: Layout,        color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  REFERENCE:    { label: "Reference",    icon: Link2,         color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ANNOUNCEMENT: { label: "Announcement", icon: Megaphone,     color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  DRAFT:     { label: "Draft",     color: "text-muted-foreground bg-muted border-border" },
  PUBLISHED: { label: "Published", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  ARCHIVED:  { label: "Archived",  color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
};

// Built-in knowledge categories mirroring the Category model
const KB_CATEGORIES = [
  { id: "all",   name: "All Documents",    icon: "📚", count: 0 },
  { id: "pb",    name: "Playbooks",        icon: "📖", count: 0 },
  { id: "sop",   name: "SOPs",             icon: "📋", count: 0 },
  { id: "train", name: "Training",         icon: "🎓", count: 0 },
  { id: "tmpl",  name: "Templates",        icon: "📄", count: 0 },
  { id: "ref",   name: "Reference",        icon: "🔗", count: 0 },
  { id: "ann",   name: "Announcements",    icon: "📢", count: 0 },
];

// Starter documents — seed content that shows the knowledge structure
const STARTER_DOCS: Document[] = [
  {
    id: "s1",
    title: "11-Stage Pipeline Playbook",
    slug: "11-stage-pipeline-playbook",
    type: "PLAYBOOK",
    status: "PUBLISHED",
    excerpt: "End-to-end guide on moving a lead from Lead Generated through to Won using all 11 pipeline stages.",
    tags: ["pipeline", "sales", "process"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s2",
    title: "ICP Scoring Framework",
    slug: "icp-scoring-framework",
    type: "REFERENCE",
    status: "PUBLISHED",
    excerpt: "Detailed breakdown of the 5-dimension ICP scoring model: Industry, Revenue, Urgency, Decision Access, Budget.",
    tags: ["icp", "scoring", "qualification"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s3",
    title: "Discovery Meeting SOP",
    slug: "discovery-meeting-sop",
    type: "SOP",
    status: "PUBLISHED",
    excerpt: "Step-by-step procedure for running a 45-minute discovery call including pre-brief, questions, and MOM generation.",
    tags: ["meeting", "discovery", "sop"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s4",
    title: "Follow-Up Sequence Templates",
    slug: "follow-up-sequence-templates",
    type: "TEMPLATE",
    status: "PUBLISHED",
    excerpt: "Email and WhatsApp templates for Days 1, 3, 7, 14, and 30 follow-up sequences.",
    tags: ["follow-up", "templates", "email"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s5",
    title: "New Rep Onboarding Guide",
    slug: "new-rep-onboarding-guide",
    type: "TRAINING",
    status: "DRAFT",
    excerpt: "Week-by-week onboarding plan for new sales reps joining the team.",
    tags: ["onboarding", "training", "new-hire"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s6",
    title: "Proposal Handoff Checklist",
    slug: "proposal-handoff-checklist",
    type: "TEMPLATE",
    status: "PUBLISHED",
    excerpt: "What every proposal package must include before going to the client. Qualification gates, MOM, and pricing sign-off.",
    tags: ["proposal", "checklist", "handoff"],
    viewCount: 0,
    author: { firstName: "System", lastName: "Admin" },
    updatedAt: new Date().toISOString(),
  },
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: DocumentType }) {
  const { label, icon: Icon, color } = DOC_TYPE_CONFIG[type];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, color } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

function DocumentCard({ doc }: { doc: Document }) {
  const initials = `${doc.author.firstName[0]}${doc.author.lastName[0]}`.toUpperCase();
  return (
    <Card className="hover:shadow-md transition-all group cursor-pointer border hover:border-primary/30">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={doc.type} />
            <StatusBadge status={doc.status} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs">Open</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <Archive className="h-3 w-3 mr-2" />Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {doc.title}
          </h3>
          {doc.excerpt && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.excerpt}</p>
          )}
        </div>

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                <Tag className="h-2 w-2" />{tag}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground px-1">+{doc.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground">
              {doc.author.firstName} {doc.author.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Eye className="h-2.5 w-2.5" />
              {doc.viewCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {new Date(doc.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");
  const [statusTab, setStatusTab] = useState("published");

  const allDocs = STARTER_DOCS;

  const filtered = allDocs.filter(doc => {
    const matchSearch = `${doc.title} ${doc.excerpt ?? ""} ${doc.tags.join(" ")}`
      .toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || doc.type === typeFilter;
    const matchStatus = statusTab === "all"
      ? true
      : statusTab === "published" ? doc.status === "PUBLISHED"
      : statusTab === "draft" ? doc.status === "DRAFT"
      : doc.status === "ARCHIVED";
    return matchSearch && matchType && matchStatus;
  });

  const publishedCount = allDocs.filter(d => d.status === "PUBLISHED").length;
  const draftCount = allDocs.filter(d => d.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Playbooks, SOPs, training docs, and sales frameworks
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Docs",  value: allDocs.length,   icon: BookOpen,    color: "text-primary" },
          { label: "Published",   value: publishedCount,   icon: TrendingUp,  color: "text-emerald-500" },
          { label: "Drafts",      value: draftCount,       icon: FileText,    color: "text-amber-500" },
          { label: "Categories",  value: 6,                icon: Filter,      color: "text-violet-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-6">
        {/* Category Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {KB_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setTypeFilter(
                    cat.id === "all" ? "all" :
                    cat.id === "pb" ? "PLAYBOOK" :
                    cat.id === "sop" ? "SOP" :
                    cat.id === "train" ? "TRAINING" :
                    cat.id === "tmpl" ? "TEMPLATE" :
                    cat.id === "ref" ? "REFERENCE" : "ANNOUNCEMENT"
                  )}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left
                    ${(typeFilter === "all" && cat.id === "all") ||
                      (typeFilter === "PLAYBOOK" && cat.id === "pb") ||
                      (typeFilter === "SOP" && cat.id === "sop") ||
                      (typeFilter === "TRAINING" && cat.id === "train") ||
                      (typeFilter === "TEMPLATE" && cat.id === "tmpl") ||
                      (typeFilter === "REFERENCE" && cat.id === "ref") ||
                      (typeFilter === "ANNOUNCEMENT" && cat.id === "ann")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </span>
                  <span className="text-[10px] bg-muted rounded px-1">{cat.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search + Status Tabs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents, tags…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Tabs value={statusTab} onValueChange={setStatusTab}>
              <TabsList className="h-9">
                <TabsTrigger value="published" className="text-xs px-3">Published</TabsTrigger>
                <TabsTrigger value="draft" className="text-xs px-3">Drafts</TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "document" : "documents"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Document Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold">No documents found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {search ? `No results for "${search}"` : "Create your first document to build the knowledge base."}
              </p>
              {!search && (
                <Button size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1.5" /> New Document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
            </div>
          )}

          {/* Starter CTA */}
          {allDocs.length === STARTER_DOCS.length && (
            <Card className="border-dashed mt-4">
              <CardContent className="flex items-center gap-4 p-4">
                <Star className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Starter docs pre-loaded</p>
                  <p className="text-xs text-muted-foreground">
                    These are template documents. Edit them or add real content via the document editor.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Edit <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
