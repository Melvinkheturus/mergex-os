"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Plus, Calendar, User, Flag, Loader2, X, Clock, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/r-context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { OptionUser } from "../../types";

interface Task {
  id: string;
  name: string;
  isComplete: boolean;
  dueDate?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string | null;
  completedAt?: string | null;
}

interface TasksCardProps {
  leadId: string;
  owners: OptionUser[];
}

function getRelativeDue(dateStr?: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "", urgent: false };
  const due = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, urgent: true };
  if (diffDays === 0) return { label: "Due Today", urgent: true };
  if (diffDays === 1) return { label: "Due Tomorrow", urgent: false };
  return {
    label: due.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    urgent: false,
  };
}

const PRIORITY_CONFIG = {
  HIGH: "text-red-500 bg-red-500/10 border-red-500/20",
  MEDIUM: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  LOW: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export function TasksCard({ leadId, owners }: TasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");

  // ─── Load tasks from DB ─────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks`);
      if (res.ok) {
        const data: Task[] = await res.json();
        setTasks(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ─── Toggle complete ────────────────────────────────────────────────────────
  const handleToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nowComplete = !task.isComplete;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, isComplete: nowComplete, completedAt: nowComplete ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isComplete: nowComplete }),
      });
      if (!res.ok) throw new Error("Failed");
      if (nowComplete) toast.success("Task marked complete");
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, isComplete: task.isComplete, completedAt: task.completedAt } : t
        )
      );
      toast.error("Failed to update task");
    }
  };

  // ─── Generic task PATCH update ──────────────────────────────────────────────
  const handleUpdate = async (taskId: string, payload: Partial<Task>) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...payload } : t))
    );

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Task updated");
      loadTasks();
    } catch {
      toast.error("Failed to update task");
      loadTasks();
    }
  };

  // ─── Create task ────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!taskName.trim()) { toast.error("Task name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: taskName.trim(),
          priority,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const newTask: Task = await res.json();
      setTasks((prev) => [...prev, newTask]);
      toast.success("Task created");
      setTaskName(""); setDueDate(""); setPriority("MEDIUM"); setAssigneeId("");
      setShowModal(false);
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete task ────────────────────────────────────────────────────────────
  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId)); // optimistic
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      toast.error("Failed to delete task");
      loadTasks(); // re-fetch to restore
    }
  };

  const active = tasks.filter((t) => !t.isComplete);
  const completed = tasks.filter((t) => t.isComplete);

  return (
    <>
      <Card className="border border-border/40 shadow-sm rounded-2xl bg-card">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Tasks ({tasks.length})
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowModal(true)}
            className="h-6 text-[10px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Task
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-1">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <p className="text-[10px] text-muted-foreground/50 italic text-center py-3">
              No tasks yet. Add one to get started.
            </p>
          )}

          {/* Active tasks */}
          {active.map((task) => {
            const due = getRelativeDue(task.dueDate);
            const assignee = owners.find((o) => o.id === task.assigneeId);
            
            const getLocalDateString = (offsetDays: number) => {
              const d = new Date();
              d.setDate(d.getDate() + offsetDays);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            };

            return (
              <ContextMenu key={task.id}>
                <ContextMenuTrigger asChild>
                  <div className="group flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors cursor-context-menu">
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-[#8B5CF6] transition-colors"
                    >
                      <Circle className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground leading-tight truncate">
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {due.label && (
                          <span className={`text-[9px] font-bold flex items-center gap-0.5 ${due.urgent ? "text-red-500" : "text-muted-foreground/70"}`}>
                            <Calendar className="h-2.5 w-2.5" />
                            {due.label}
                          </span>
                        )}
                        {assignee && (
                          <span className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5">
                            <User className="h-2.5 w-2.5" />
                            {assignee.firstName}
                          </span>
                        )}
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${PRIORITY_CONFIG[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-400 transition-all mt-0.5 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-52">
                  <ContextMenuItem onClick={() => handleToggle(task.id)}>
                    <CheckCircle2 className="size-3.5 opacity-70 mr-2" />
                    Mark as Completed
                  </ContextMenuItem>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      <Calendar className="size-3.5 opacity-70 mr-2" />
                      Reschedule
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">
                      <ContextMenuItem onClick={() => handleUpdate(task.id, { dueDate: getLocalDateString(0) })}>
                        Today
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleUpdate(task.id, { dueDate: getLocalDateString(1) })}>
                        Tomorrow
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleUpdate(task.id, { dueDate: getLocalDateString(7) })}>
                        Next Week
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleUpdate(task.id, { dueDate: null })}>
                        Clear Due Date
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      <UserCheck className="size-3.5 opacity-70 mr-2" />
                      Assign Task
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                      {owners.map((owner) => (
                        <ContextMenuItem
                          key={owner.id}
                          onClick={() => handleUpdate(task.id, { assigneeId: owner.id })}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            {owner.avatarUrl ? (
                              <img src={owner.avatarUrl} className="h-3.5 w-3.5 rounded-full shrink-0" alt="" />
                            ) : (
                              <span className="h-3.5 w-3.5 rounded-full bg-violet-500/10 text-violet-500 text-[8px] flex items-center justify-center shrink-0">
                                {owner.firstName?.[0] || "U"}
                              </span>
                            )}
                            {`${owner.firstName || ""} ${owner.lastName || ""}`.trim()}
                          </span>
                        </ContextMenuItem>
                      ))}
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleUpdate(task.id, { assigneeId: null })}>
                        Unassigned
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuSeparator />

                  <ContextMenuItem variant="destructive" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="size-3.5 opacity-70 mr-2" />
                    Delete Task
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <div className="border-t border-border/10 pt-1 mt-1 space-y-1">
              {completed.map((task) => (
                <ContextMenu key={task.id}>
                  <ContextMenuTrigger asChild>
                    <div className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/20 transition-colors cursor-context-menu">
                      <button
                        type="button"
                        onClick={() => handleToggle(task.id)}
                        className="shrink-0 text-[#8B5CF6]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <p className="text-[10px] font-medium text-muted-foreground/50 line-through flex-1 truncate">
                        {task.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-400 transition-all shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent className="w-50">
                    <ContextMenuItem onClick={() => handleToggle(task.id)}>
                      <Circle className="size-3.5 opacity-70 mr-2" />
                      Mark as In Progress
                    </ContextMenuItem>
                    
                    <ContextMenuSeparator />
                    
                    <ContextMenuItem variant="destructive" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="size-3.5 opacity-70 mr-2" />
                      Delete Task
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Task Name *</Label>
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Call client to confirm requirements"
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Due Date</Label>
                <DateTimePicker
                  value={dueDate}
                  onChange={(val) => setDueDate(val)}
                  mode="date"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                    <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                    <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={o.id} className="text-xs">
                      {`${o.firstName || ""} ${o.lastName || ""}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={submitting || !taskName.trim()}
              className="text-xs h-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
