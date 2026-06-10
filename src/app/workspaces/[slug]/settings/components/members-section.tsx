"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Teammate } from "../types";

export function MembersSection({ teammates }: { teammates: Teammate[] }) {
  return (
    <div className="space-y-6">
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B5CF6]" />
            Brand Members
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            These users currently have access to this brand workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {teammates.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No members yet. Invite team members from Team &amp; Access.
            </div>
          ) : (
            teammates.map((t) => {
              const initials = ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
              const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-xs font-extrabold text-[#8B5CF6] shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{t.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold">
                      {t.role.label}
                    </Badge>
                    {t.role.name !== "super_admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`${name} removed from this brand.`)}
                        className="h-7 text-[10px] font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
