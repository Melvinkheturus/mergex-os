import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateRoleCardProps {
  newRoleTitle: string;
  setNewRoleTitle: (v: string) => void;
  newRoleDesc: string;
  setNewRoleDesc: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
}

export function CreateRoleCard({
  newRoleTitle,
  setNewRoleTitle,
  newRoleDesc,
  setNewRoleDesc,
  creating,
  onCreate,
}: CreateRoleCardProps) {
  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#8B5CF6]" />
          Create Custom Role
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Define a new security template with custom administrative access controls.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role Title</Label>
          <Input
            placeholder="e.g. Sales Director"
            value={newRoleTitle}
            onChange={(e) => setNewRoleTitle(e.target.value)}
            className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Description</Label>
          <Input
            placeholder="e.g. Lead pipelines & closing metrics"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          size="sm"
          onClick={onCreate}
          disabled={creating || !newRoleTitle.trim() || !newRoleDesc.trim()}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer h-9 px-5 rounded-lg disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Creating…</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Create Role</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
