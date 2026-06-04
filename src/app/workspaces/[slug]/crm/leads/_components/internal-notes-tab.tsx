"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StickyNote, Plus, Lock, Users, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Note } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface InternalNotesTabProps {
  leadId: string;
}

export function InternalNotesTab({ leadId }: InternalNotesTabProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"TEAM" | "PRIVATE">("TEAM");
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || null, content: content.trim(), visibility }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setContent("");
      setTitle("");
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Compose */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/20 bg-muted/5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-amber-500" />
            Add Internal Note
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Private team notes - not visible to the client
          </p>
        </div>
        <div className="p-5 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[100px] text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            {/* Visibility toggle */}
            <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20">
              <button
                onClick={() => setVisibility("TEAM")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  visibility === "TEAM"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3 w-3" /> Team
              </button>
              <button
                onClick={() => setVisibility("PRIVATE")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  visibility === "PRIVATE"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="h-3 w-3" /> Private
              </button>
            </div>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Note
            </Button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
            <StickyNote className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-sm font-medium">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add team notes for this lead above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const creatorName = note.creator
              ? `${note.creator.firstName ?? ""} ${note.creator.lastName ?? ""}`.trim()
              : "Unknown";
            const initials = creatorName[0]?.toUpperCase() ?? "?";

            return (
              <div
                key={note.id}
                className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[9px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground">{creatorName}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {format(new Date(note.createdAt), "d MMM yyyy, HH:mm")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] shrink-0 ${
                      note.visibility === "PRIVATE"
                        ? "border-rose-500/30 text-rose-500"
                        : "border-border/30 text-muted-foreground"
                    }`}
                  >
                    {note.visibility === "PRIVATE" ? (
                      <Lock className="h-2.5 w-2.5 mr-1" />
                    ) : (
                      <Users className="h-2.5 w-2.5 mr-1" />
                    )}
                    {note.visibility}
                  </Badge>
                </div>

                {note.title && (
                  <p className="text-xs font-semibold text-foreground">{note.title}</p>
                )}
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
