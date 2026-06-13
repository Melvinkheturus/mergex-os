import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/r-alert-dialog";
import { Teammate } from "../../types";

interface SuspendDialogProps {
  suspendTarget: Teammate | null;
  onClose: () => void;
  suspendCountsLoading: boolean;
  suspendCounts: { leads: number; tasks: number; clients: number } | null;
  suspending: boolean;
  onConfirm: () => void;
}

export function SuspendDialog({
  suspendTarget,
  onClose,
  suspendCountsLoading,
  suspendCounts,
  suspending,
  onConfirm,
}: SuspendDialogProps) {
  const hasRecords =
    suspendCounts && (suspendCounts.leads + suspendCounts.tasks + suspendCounts.clients) > 0;

  return (
    <AlertDialog
      open={!!suspendTarget}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Suspend Account
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
                <span className="font-bold text-foreground">
                  {suspendTarget
                    ? suspendTarget.firstName
                      ? `${suspendTarget.firstName} ${suspendTarget.lastName ?? ""}`.trim()
                      : suspendTarget.email
                    : ""}
                </span>
                {suspendTarget && <span className="font-mono text-[10px]"> ({suspendTarget.email})</span>}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-2">
          {suspendCountsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : suspendCounts && (suspendCounts.leads + suspendCounts.tasks + suspendCounts.clients) > 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                This member currently owns:
              </p>
              <ul className="space-y-1.5">
                {suspendCounts.leads > 0 && (
                  <li className="flex items-center gap-2 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold">{suspendCounts.leads}</span> Lead
                    {suspendCounts.leads !== 1 ? "s" : ""}
                  </li>
                )}
                {suspendCounts.clients > 0 && (
                  <li className="flex items-center gap-2 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold">{suspendCounts.clients}</span> Client
                    {suspendCounts.clients !== 1 ? "s" : ""}
                  </li>
                )}
                {suspendCounts.tasks > 0 && (
                  <li className="flex items-center gap-2 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold">{suspendCounts.tasks}</span> Task
                    {suspendCounts.tasks !== 1 ? "s" : ""}
                  </li>
                )}
              </ul>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                These records will remain assigned after suspension. You can manually reassign them from the
                CRM.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              This member has no active record ownership. Their account will be locked immediately and they
              will not be able to log in.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={suspending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={suspending || suspendCountsLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer font-bold"
          >
            {suspending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Suspending…
              </>
            ) : hasRecords ? (
              "Suspend Anyway →"
            ) : (
              "Suspend Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
