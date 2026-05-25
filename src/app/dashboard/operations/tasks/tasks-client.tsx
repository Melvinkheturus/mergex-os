"use client";

import { useState } from "react";
import {
  CheckSquare, Plus, Search, Calendar, MoreHorizontal,
  CheckCircle2, Circle, Loader2, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CANCELLED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; color: string }> = {
  TODO:        { label: "To Do",       icon: Circle,       color: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", icon: Loader2,      color: "text-blue-500" },
  REVIEW:      { label: "In Review",   icon: AlertCircle,  color: "text-amber-500" },
  DONE:        { label: "Done",        icon: CheckCircle2, color: "text-emerald-500" },
  CANCELLED:   { label: "Cancelled",   icon: XCircle,      color: "text-muted-foreground" },
};

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-slate-400", MEDIUM: "bg-blue-500", HIGH: "bg-amber-500", URGENT: "bg-red-500",
};

const STARTER: Task[] = [
  { id: "t1", title: "Complete ICP scoring for all leads", status: "TODO",        priority: "HIGH",   dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
  { id: "t2", title: "Create follow-up email templates",   status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { id: "t3", title: "Invite team members",                status: "TODO",        priority: "MEDIUM" },
  { id: "t4", title: "Upload first playbook to KB",        status: "TODO",        priority: "LOW" },
  { id: "t5", title: "Set up Neon database connection",    status: "DONE",        priority: "HIGH" },
];

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const sc = STATUS_CONFIG[task.status];
  const Icon = sc.icon;
  const isOverdue = task.dueDate && !["DONE","CANCELLED"].includes(task.status) && new Date(task.dueDate) < new Date();

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors group ${task.status === "DONE" ? "opacity-60" : ""}`}>
      <button onClick={() => onToggle(task.id)} className="mt-0.5 shrink-0">
        <Icon className={`h-4 w-4 ${sc.color}`} />
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            <span className="text-[10px] text-muted-foreground">{task.priority}</span>
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
              <Calendar className="h-2.5 w-2.5" />
              {isOverdue ? "Overdue · " : ""}
              {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">Assign To</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TasksPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");
  const [tasks, setTasks] = useState<Task[]>(STARTER);

  const toggle = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t));

  const filtered = tasks.filter(t => {
    const ok = `${t.title}`.toLowerCase().includes(search.toLowerCase());
    const st = tab === "active" ? ["TODO","IN_PROGRESS","REVIEW"].includes(t.status)
      : tab === "done" ? t.status === "DONE" : true;
    return ok && st;
  });

  const done = tasks.filter(t => t.status === "DONE").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Sales operations tasks and action items</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Task</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: tasks.length },
          { label: "Completed",   value: done },
          { label: "In Progress", value: tasks.filter(t => t.status === "IN_PROGRESS").length },
          { label: "Overdue",     value: tasks.filter(t => t.dueDate && !["DONE","CANCELLED"].includes(t.status) && new Date(t.dueDate) < new Date()).length },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Completion</span>
          <span className="text-sm font-bold">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1.5">{done} of {tasks.length} tasks completed</p>
      </CardContent></Card>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="active" className="text-xs px-3">Active</TabsTrigger>
            <TabsTrigger value="done"   className="text-xs px-3">Done</TabsTrigger>
            <TabsTrigger value="all"    className="text-xs px-3">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Tasks
            <Badge variant="secondary" className="text-xs ml-auto">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {filtered.length === 0
            ? <div className="flex items-center justify-center py-12 text-sm text-muted-foreground"><CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />No tasks here.</div>
            : <div className="space-y-0.5">{filtered.map(t => <TaskRow key={t.id} task={t} onToggle={toggle} />)}</div>
          }
        </CardContent>
      </Card>
    </div>
  );
}
