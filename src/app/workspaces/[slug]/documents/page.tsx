import { FileText, Sparkles, FolderClosed, FileSignature, FileSpreadsheet } from "lucide-react";

export const metadata = { title: "Documents | MergeX OS" };

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-semibold tracking-wider uppercase">
          <Sparkles className="w-3 h-3" />
          Document Workspace
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents Vault</h1>
          <p className="text-sm text-muted-foreground">
            Author and manage templates, active proposals, and legal contracts.
          </p>
        </div>

        <div className="border border-border/40 bg-card/40 rounded-2xl p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/5 flex items-center justify-center border border-[#8B5CF6]/15">
              <FileText className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Under Construction</h2>
              <p className="text-xs text-muted-foreground">Phase 1: Shared Templates & Legal Proposals</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            The Documents vault will store, review, and track client signings. The sidebar left-rail has adjusted to show your active Document context.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border/20">
            {[
              { label: "Templates", desc: "Standard deal templates", icon: FolderClosed },
              { label: "Active Proposals", desc: "Sent proposal sheets", icon: FileSpreadsheet },
              { label: "Signed Contracts", desc: "Legally signed logs", icon: FileSignature },
            ].map((sub) => {
              const Icon = sub.icon;
              return (
                <div key={sub.label} className="p-3 border border-border/30 rounded-xl bg-muted/5 space-y-1.5">
                  <Icon className="h-4 w-4 text-[#8B5CF6]/70" />
                  <h3 className="text-xs font-bold text-foreground">{sub.label}</h3>
                  <p className="text-[10px] text-muted-foreground leading-snug">{sub.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
