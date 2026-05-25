import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
      <div className="text-center flex flex-col items-center gap-6 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-[#EF4444]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
