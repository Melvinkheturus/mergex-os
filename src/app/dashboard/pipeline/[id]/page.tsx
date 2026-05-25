"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-5">
      <div className="flex items-center gap-3 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C] mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Lead Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Viewing details for lead ID: {id}</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Lead details view for {id} is under construction.
      </div>
    </div>
  );
}
