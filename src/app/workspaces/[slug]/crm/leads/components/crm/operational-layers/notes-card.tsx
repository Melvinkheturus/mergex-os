"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Plus, Send, Loader2, AtSign, X, Trash2,
  Pin, Lock, Globe, Users, PencilLine, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { OptionUser } from "../../types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
} from "@/components/ui/r-context-menu";

// ─── Note type matching the Note Prisma model ─────────────────────────────────
interface Note {
  id: string;
  leadId: string;
  brandId: string;
  title: string | null;
  content: string;
  visibility: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface NotesCardProps {
  leadId: string;
  owners: OptionUser[];
  onNoteAdded?: () => void;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function NotesCard({ leadId, owners, onNoteAdded }: NotesCardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pinning, Editing, and Visibility States
  const [pinnedNoteIds, setPinnedNoteIds] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Load notes from the dedicated /notes endpoint ───────────────────────────
  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`);
      if (res.ok) {
        const data: Note[] = await res.json();
        setNotes(data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotes(); }, [leadId]);

  // ─── Mentions handling ────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const caret = e.target.selectionStart;
    const before = val.slice(0, caret);
    const match = before.match(/@(\w*)$/);
    if (match) { setShowMentions(true); setMentionFilter(match[1]); setMentionIndex(0); }
    else setShowMentions(false);
  };

  const filteredOwners = owners.filter((o) =>
    `${o.firstName} ${o.lastName}`.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const insertMention = (user: OptionUser) => {
    if (!textareaRef.current) return;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const caret = textareaRef.current.selectionStart;
    const newBefore = content.slice(0, caret).replace(/@\w*$/, `@${name} `);
    setContent(newBefore + content.slice(caret));
    setShowMentions(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions || filteredOwners.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => (i + 1) % filteredOwners.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((i) => (i - 1 + filteredOwners.length) % filteredOwners.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(filteredOwners[mentionIndex]); }
    else if (e.key === "Escape") setShowMentions(false);
  };

  // ─── Submit note ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim()) { toast.error("Note cannot be empty"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Note added");
      setContent("");
      setShowForm(false);
      // Notify sidebar cards to refresh (timeline will pick up the new NOTE activity)
      window.dispatchEvent(new CustomEvent("crm-activity-logged"));
      await loadNotes();
      onNoteAdded?.();
    } catch { toast.error("Failed to add note"); }
    finally { setSubmitting(false); }
  };

  // ─── Delete note (soft delete) ────────────────────────────────────────────────
  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    // Optimistic removal
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes?noteId=${encodeURIComponent(noteId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
      await loadNotes(); // restore on error
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Pinned notes ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`pinned-notes-${leadId}`);
    if (stored) {
      try {
        setPinnedNoteIds(JSON.parse(stored));
      } catch {
        setPinnedNoteIds([]);
      }
    } else {
      setPinnedNoteIds([]);
    }
  }, [leadId]);

  const togglePin = (noteId: string) => {
    let updated: string[];
    if (pinnedNoteIds.includes(noteId)) {
      updated = pinnedNoteIds.filter((id) => id !== noteId);
      toast.success("Note unpinned");
    } else {
      updated = [...pinnedNoteIds, noteId];
      toast.success("Note pinned to top");
    }
    setPinnedNoteIds(updated);
    localStorage.setItem(`pinned-notes-${leadId}`, JSON.stringify(updated));
  };

  // ─── Edit note ────────────────────────────────────────────────────────────────
  const startEdit = (noteId: string, currentContent: string) => {
    setEditingNoteId(noteId);
    setEditingContent(currentContent);
  };

  const handleEditSave = async (noteId: string) => {
    if (!editingContent.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    try {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: editingContent.trim() } : n))
      );
      setEditingNoteId(null);
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content: editingContent.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Note updated");
      await loadNotes();
    } catch {
      toast.error("Failed to update note");
      await loadNotes();
    }
  };

  // ─── Change visibility ────────────────────────────────────────────────────────
  const handleVisibilityChange = async (noteId: string, visibility: string) => {
    try {
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, visibility } : n))
      );
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, visibility }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Visibility updated to ${visibility.toLowerCase()}`);
      await loadNotes();
    } catch {
      toast.error("Failed to update visibility");
      await loadNotes();
    }
  };

  return (
    <Card className="border border-border/40 shadow-sm rounded-2xl bg-card">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-[#8B5CF6]" />
          Notes {notes.length > 0 && `(${notes.length})`}
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setShowForm(!showForm); setTimeout(() => textareaRef.current?.focus(), 100); }}
          className="h-6 text-[10px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Note
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        {/* Add Note Form */}
        {showForm && (
          <div className="relative border border-[#8B5CF6]/20 rounded-xl p-3 bg-[#8B5CF6]/3 space-y-2">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a collaboration note... Use @ to mention"
                className="text-xs resize-none min-h-[72px] border-border/30 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/40"
              />
              {/* Mentions dropdown */}
              {showMentions && filteredOwners.length > 0 && (
                <div className="absolute left-0 bottom-full mb-1 w-full bg-popover border border-border rounded-xl shadow-lg z-50 p-1 space-y-0.5">
                  <p className="text-[9px] text-muted-foreground font-bold px-2 py-0.5 flex items-center gap-1 uppercase tracking-wider">
                    <AtSign className="h-2.5 w-2.5" /> Mention
                  </p>
                  {filteredOwners.map((user, idx) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => insertMention(user)}
                      className={`w-full text-left text-xs font-semibold px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        idx === mentionIndex ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "hover:bg-muted"
                      }`}
                    >
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="text-[9px] text-muted-foreground/60">{user.designation || "Team"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setContent(""); }} className="h-7 text-[10px]">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="h-7 text-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-3"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3 w-3 mr-1.5" /> Save</>}
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {loading && notes.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/40 italic text-center py-3">
            No collaboration notes yet.
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-border/10">
            {[...notes]
              .sort((a, b) => {
                const aPinned = pinnedNoteIds.includes(a.id);
                const bPinned = pinnedNoteIds.includes(b.id);
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((note) => {
                const authorName = note.User
                  ? `${note.User.firstName || ""} ${note.User.lastName || ""}`.trim() || "Team"
                  : "System";
                const initials = authorName.charAt(0).toUpperCase();
                const relTime = getRelativeTime(note.createdAt);
                const isDeleting = deletingId === note.id;
                const isPinned = pinnedNoteIds.includes(note.id);
                const isEditing = editingNoteId === note.id;

                const getVisibilityIcon = (vis: string) => {
                  const v = (vis || "TEAM").toUpperCase();
                  if (v === "PRIVATE") return <Lock className="h-2.5 w-2.5 text-rose-400" />;
                  if (v === "PUBLIC") return <Globe className="h-2.5 w-2.5 text-blue-400" />;
                  return <Users className="h-2.5 w-2.5 text-emerald-400" />;
                };

                return (
                  <ContextMenu key={note.id}>
                    <ContextMenuTrigger asChild>
                      <div className={`group py-3 space-y-1.5 transition-opacity ${isDeleting ? "opacity-40" : ""} hover:bg-muted/10 px-2 -mx-2 rounded-lg cursor-context-menu`}>
                        {/* Author row */}
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center text-[9px] font-bold text-[#8B5CF6] shrink-0">
                            {initials}
                          </span>
                          <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                            {authorName}
                            {isPinned && <Pin className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50 ml-auto flex items-center gap-1.5">
                            {getVisibilityIcon(note.visibility)}
                            {relTime}
                          </span>
                          {/* Delete button — visible on hover */}
                          <button
                            type="button"
                            onClick={() => handleDelete(note.id)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-400 transition-all ml-1 shrink-0 disabled:pointer-events-none"
                            title="Delete note"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {/* Content */}
                        {isEditing ? (
                          <div className="pl-7 space-y-2 mt-1">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="text-xs min-h-[50px] resize-none focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/40 bg-background/50"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingNoteId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" className="h-6 text-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white" onClick={() => handleEditSave(note.id)}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-foreground/80 leading-relaxed pl-7 wrap-break-word">
                            {note.content}
                          </p>
                        )}
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-48">
                      <ContextMenuItem onClick={() => startEdit(note.id, note.content)}>
                        <PencilLine className="size-3.5 opacity-70 mr-2" />
                        Edit Note
                      </ContextMenuItem>
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Eye className="size-3.5 opacity-70 mr-2" />
                          Change Visibility
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-36">
                          <ContextMenuRadioGroup
                            value={(note.visibility || "TEAM").toUpperCase()}
                            onValueChange={(v) => handleVisibilityChange(note.id, v)}
                          >
                            <ContextMenuRadioItem value="PRIVATE">
                              <Lock className="size-3 mr-1.5 text-rose-400" />
                              Private
                            </ContextMenuRadioItem>
                            <ContextMenuRadioItem value="PUBLIC">
                              <Globe className="size-3 mr-1.5 text-blue-400" />
                              Public
                            </ContextMenuRadioItem>
                            <ContextMenuRadioItem value="TEAM">
                              <Users className="size-3 mr-1.5 text-emerald-400" />
                              Shared
                            </ContextMenuRadioItem>
                          </ContextMenuRadioGroup>
                        </ContextMenuSubContent>
                      </ContextMenuSub>

                      <ContextMenuItem onClick={() => togglePin(note.id)}>
                        <Pin className="size-3.5 opacity-70 mr-2" />
                        {isPinned ? "Unpin Note" : "Pin to Top"}
                      </ContextMenuItem>

                      <ContextMenuSeparator />

                      <ContextMenuItem variant="destructive" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="size-3.5 opacity-70 mr-2" />
                        Delete Note
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
