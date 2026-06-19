import React, { useState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Teammate } from "../../types";

interface DeleteMemberDialogProps {
  deleteTarget: Teammate | null;
  onClose: () => void;
  deleting: boolean;
  onConfirm: () => void;
}

export function DeleteMemberDialog({
  deleteTarget,
  onClose,
  deleting,
  onConfirm,
}: DeleteMemberDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  // Reset the typed value whenever the target changes (dialog re-opens)
  useEffect(() => {
    setConfirmText("");
  }, [deleteTarget]);

  const emailMatches = !!deleteTarget && confirmText.trim() === deleteTarget.email;

  return (
    <AlertDialog
      open={!!deleteTarget}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Permanently Delete Account
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
                <span className="font-bold text-foreground">
                  {deleteTarget
                    ? deleteTarget.firstName
                      ? `${deleteTarget.firstName} ${deleteTarget.lastName ?? ""}`.trim()
                      : deleteTarget.email
                    : ""}
                </span>
                {deleteTarget && (
                  <span className="font-mono text-[10px]"> ({deleteTarget.email})</span>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-2 space-y-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              This action is irreversible.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The account will be permanently removed from both the database and Clerk. Owned
              leads, clients and tasks are preserved but lose their owner reference. This cannot be
              undone.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Type{" "}
              <span className="font-mono text-foreground">{deleteTarget?.email}</span>{" "}
              to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteTarget?.email ?? ""}
              autoComplete="off"
              disabled={deleting}
              className="text-xs"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={deleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={deleting || !emailMatches}
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer font-bold disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Deleting…
              </>
            ) : (
              "Delete Permanently"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
